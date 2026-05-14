"""
Proteção CSRF (Cross-Site Request Forgery)
"""
import secrets
from fastapi import Request
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class CSRFProtection:
    
    def __init__(self):
        self.token_key = "_csrf_token"
        self.header_name = "X-CSRF-Token"
    
    def generate_token(self) -> str:
        return secrets.token_urlsafe(32)
    
    def get_token_from_session(self, request: Request) -> Optional[str]:
        if not hasattr(request, 'session'):
            return None
        return request.session.get(self.token_key)
    
    def set_token_in_session(self, request: Request, token: str):
        if hasattr(request, 'session'):
            request.session[self.token_key] = token
    
    def get_or_create_token(self, request: Request) -> str:
        token = self.get_token_from_session(request)
        if not token:
            token = self.generate_token()
            self.set_token_in_session(request, token)
            logger.debug(f"Novo token CSRF gerado para sessão")
        return token
    
    def validate_token(self, request: Request, token: str) -> bool:
        session_token = self.get_token_from_session(request)
        if not session_token or not token:
            return False
        
        # Usar compare_digest para evitar timing attacks
        return secrets.compare_digest(session_token, token)
    
    def get_token_from_request(self, request: Request) -> Optional[str]:
        # Tentar header primeiro (padrão para APIs)
        token = request.headers.get(self.header_name)
        if token:
            return token.strip()
        
        return None
    
    def clear_token(self, request: Request):
        if hasattr(request, 'session') and self.token_key in request.session:
            del request.session[self.token_key]
            logger.debug("Token CSRF removido da sessão")


# Instância global
csrf_protection = CSRFProtection()
