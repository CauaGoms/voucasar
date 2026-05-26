import os
import time
from collections import deque
from threading import Lock
from fastapi import HTTPException, Request, status

_LIMITERS: dict[str, deque] = {}
_LOCK = Lock()


def _get_client_ip(request: Request) -> str:
    """
    Obtém o IP real do cliente.
    Só confia em X-Forwarded-For se o IP direto for de uma rede privada
    (ou seja, um proxy/load-balancer confiável, não o cliente final).
    Isso evita que clientes injetem um X-Forwarded-For falso para burlar o rate limit.
    """
    direct_ip = request.client.host if request.client else None

    # Detecta se o IP direto é de uma rede privada/confiável (proxy/nginx)
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

    return direct_ip or "unknown"


def enforce_rate_limit(request: Request, key: str, limit: int, window_seconds: int) -> None:
    now = time.time()
    client_ip = _get_client_ip(request)
    bucket_key = f"{key}:{client_ip}"

    with _LOCK:
        bucket = _LIMITERS.get(bucket_key)
        if bucket is None:
            bucket = deque()
            _LIMITERS[bucket_key] = bucket

        cutoff = now - window_seconds
        while bucket and bucket[0] < cutoff:
            bucket.popleft()

        if len(bucket) >= limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Muitas requisicoes. Tente novamente em alguns instantes.",
                headers={"Retry-After": str(window_seconds)},
            )

        bucket.append(now)


def get_limit_from_env(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except ValueError:
        return default
