from fastapi import FastAPI, Request, status
from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
from conexao_db import get_pool
import logging
import os
import uuid
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Detectar ambiente
ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')
IS_PRODUCTION = ENVIRONMENT == 'production'
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: inicializa o connection pool
    pool = get_pool()
    if pool:
        logger.info("Connection pool inicializado com sucesso!")
    else:
        logger.error("Falha ao inicializar connection pool")
    
    yield
    
    # Shutdown: limpa o connection pool
    if pool:
        logger.info("Connection pool limpo")

app = FastAPI(
    title="VouCasar - Lista de Casamento",
    description="API para gerenciamento de lista de casamento",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    
    user_id = '-'
    if hasattr(request, 'session'):
        usuario = request.session.get('usuario')
        if usuario:
            user_id = str(usuario.get('id', '-'))
    
    ip = request.client.host if request.client else '-'
    user_agent = request.headers.get('user-agent', '-')[:100]
    
    log_extra = {
        'request_id': request_id,
        'user_id': user_id,
        'ip': ip,
        'user_agent': user_agent
    }
    
    request.state.log_extra = log_extra
    response = await call_next(request)
    return response

@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    # Proteção CSRF
    if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
        if request.url.path not in ["/usuario", "/usuario/auth/login"]: # Ignorar nestas rotas 
            token_recebido = csrf_protection.get_token_from_request(request)
            if not csrf_protection.validate_token(request, token_recebido):
                return JSONResponse(status_code=403, content={"detail": "Token CSRF inválido ou ausente"})

    response = await call_next(request)
    
    # Garantir que o token seja criado e enviado pro frontend
    token = csrf_protection.get_or_create_token(request)
    if token:
        response.set_cookie(
            key="csrf_token",
            value=token,
            httponly=False,  # O frontend precisa ler pro Axios pegar
            samesite="lax",
            secure=IS_PRODUCTION
        )

    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

@app.middleware("http")
async def catch_exceptions_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception:
        logger.exception("Erro não tratado na aplicação")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"erro": "Erro interno do servidor. Tente novamente mais tarde."},
        )

SECRET_KEY = os.getenv('SECRET_KEY', 'voucasar-secret-key-change-in-production')
if IS_PRODUCTION and SECRET_KEY == 'voucasar-secret-key-change-in-production':
    raise ValueError("SECRET_KEY deve ser alterada em produção")

app.add_middleware(
    SessionMiddleware, 
    secret_key=SECRET_KEY,
    max_age=2592000,
    same_site="lax",
    https_only=IS_PRODUCTION,
    session_cookie="voucasar_session"
)

allowed_origins = [FRONTEND_URL]
if not IS_PRODUCTION:
    allowed_origins.extend([
        "http://localhost:3000", 
        "http://localhost:5173", 
        "http://127.0.0.1:5173"   
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

# Importando routers de VouCasar
from backend.routers.usuario import router as usuario_router
from backend.routers.casal import router as casal_router
from backend.routers.presente import router as presente_router
from backend.routers.fonte_compra import router as fonte_compra_router
from backend.routers.transacao_presente import router as transacao_presente_router
from util.csrf import csrf_protection

# Incluindo routers
app.include_router(usuario_router)
app.include_router(casal_router)
app.include_router(presente_router)
app.include_router(fonte_compra_router)
app.include_router(transacao_presente_router)

@app.get("/")
async def root():
    return {"mensagem": "VouCasar - API de Lista de Casamento", "versao": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app="main:app", host="0.0.0.0", port=8000, reload=True)