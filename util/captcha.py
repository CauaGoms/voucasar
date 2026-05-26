import json
import os
import urllib.parse
import urllib.request
from fastapi import HTTPException, Request, status


def _get_captcha_secret() -> str:
    return os.getenv("TURNSTILE_SECRET_KEY", "").strip()


def _get_captcha_token(request: Request, data: dict | None) -> str:
    token = request.headers.get("X-Captcha-Token")
    if token:
        return token.strip()
    return (data or {}).get("captcha_token", "").strip()


def _get_client_ip(request: Request) -> str:
    """
    Só confia em X-Forwarded-For quando o IP direto é de um proxy privado/confiável.
    Evita spoofing de IP para burlar verificação do captcha.
    """
    direct_ip = request.client.host if request.client else None

    def _is_private(ip: str) -> bool:
        return (
            ip.startswith("10.") or
            ip.startswith("172.") or
            ip.startswith("192.168.") or
            ip in ("127.0.0.1", "::1", "localhost")
        )

    if direct_ip and _is_private(direct_ip):
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()

    return direct_ip or ""


def _verify_turnstile(token: str, remoteip: str) -> bool:
    secret = _get_captcha_secret()
    if not secret:
        return True

    payload = {
        "secret": secret,
        "response": token,
    }
    if remoteip:
        payload["remoteip"] = remoteip

    data = urllib.parse.urlencode(payload).encode("utf-8")
    req = urllib.request.Request(
        url="https://challenges.cloudflare.com/turnstile/v0/siteverify",
        data=data,
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=5) as response:
        body = response.read().decode("utf-8")
        result = json.loads(body)
        return bool(result.get("success"))


def enforce_captcha_if_enabled(request: Request, data: dict | None) -> None:
    secret = _get_captcha_secret()
    if not secret:
        return

    token = _get_captcha_token(request, data)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Captcha obrigatorio.",
        )

    if not _verify_turnstile(token, _get_client_ip(request)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Captcha invalido.",
        )
