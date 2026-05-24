import base64
import hashlib
import hmac
import json
import os
import secrets
import time
from typing import Optional


def _get_secret() -> str:
    secret = os.getenv("SECRET_KEY", "")
    if not secret:
        raise ValueError("SECRET_KEY nao configurada")
    return secret


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("ascii").rstrip("=")


def _b64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def gerar_token_confirmacao(transacao_id: int, validade_minutos: int = 60 * 24) -> str:
    payload = {
        "tid": int(transacao_id),
        "exp": int(time.time()) + int(validade_minutos) * 60,
        "nonce": secrets.token_urlsafe(8)
    }
    payload_raw = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    payload_b64 = _b64url_encode(payload_raw)
    assinatura = hmac.new(
        _get_secret().encode("utf-8"),
        payload_b64.encode("ascii"),
        hashlib.sha256
    ).hexdigest()
    return f"{payload_b64}.{assinatura}"


def validar_token_confirmacao(token: str, transacao_id: int) -> Optional[dict]:
    try:
        payload_b64, assinatura = token.split(".", 1)
    except ValueError:
        return None

    assinatura_esperada = hmac.new(
        _get_secret().encode("utf-8"),
        payload_b64.encode("ascii"),
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(assinatura, assinatura_esperada):
        return None

    try:
        payload = json.loads(_b64url_decode(payload_b64).decode("utf-8"))
    except Exception:
        return None

    if int(payload.get("tid", -1)) != int(transacao_id):
        return None

    if int(payload.get("exp", 0)) < int(time.time()):
        return None

    return payload
