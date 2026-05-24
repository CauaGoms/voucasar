from fastapi import APIRouter, Request, Body, HTTPException, status
from fastapi.responses import JSONResponse
import logging
from util.auth_decorator import requer_autenticacao, criar_sessao, destruir_sessao
from util.security import criar_hash_senha, verificar_senha, is_bcrypt_hash
from util.rate_limit import enforce_rate_limit, get_limit_from_env
from util.captcha import enforce_captcha_if_enabled
from util.csrf import csrf_protection
from backend.data.model.usuario import Usuario
from backend.data.repo import usuario as usuario_repo
from backend.data.repo import casal as casal_repo

router = APIRouter(prefix="/usuario", tags=["usuario"])
logger = logging.getLogger(__name__)

@router.post("")
async def criar_usuario(request: Request, usuario_data: dict = Body(...)):
    """Cria um novo usuário"""
    try:
        enforce_rate_limit(
            request,
            key="public:signup",
            limit=get_limit_from_env("RATE_LIMIT_SIGNUP", 5),
            window_seconds=60
        )
        enforce_captcha_if_enabled(request, usuario_data)
        senha_hash = criar_hash_senha(usuario_data.get("senha"))
        usuario = Usuario(
            id=0,
            nome=usuario_data.get("nome"),
            email=usuario_data.get("email"),
            senha=senha_hash
        )
        cod_usuario = usuario_repo.inserir(usuario)
        # REMOVIDO: auto-vinculação sem consentimento
        # O parceiro deve aceitar o convite explicitamente via POST /casal/{id}/aceitar-convite
        return JSONResponse({
            "id": cod_usuario,
            "nome": usuario.nome,
            "email": usuario.email,
            "mensagem": "Usuário criado com sucesso"
        })
    except Exception as e:
        logger.error(f"Erro ao criar usuário: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{usuario_id}")
@requer_autenticacao()
async def buscar_usuario_endpoint(usuario_id: int, request: Request, usuario_logado: dict = None):
    """Busca um usuário por ID — somente o próprio usuário pode consultar seus dados"""
    try:
        # SEGURANÇA: Usuário só pode ver seus próprios dados (previne IDOR)
        if usuario_id != usuario_logado.get("id"):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado")
        usuario = usuario_repo.buscar_por_id(usuario_id)
        if not usuario:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")
        return JSONResponse({
            "id": usuario.id,
            "nome": usuario.nome,
            "email": usuario.email
        })
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Erro ao buscar usuário: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.put("/{usuario_id}")
@requer_autenticacao()
async def atualizar_usuario_endpoint(usuario_id: int, request: Request, usuario_data: dict = Body(...), usuario_logado: dict = None):
    """Atualiza um usuário — somente o próprio usuário pode editar seus dados"""
    try:
        # SEGURANÇA: Usuário só pode editar seus próprios dados (previne IDOR + account takeover)
        if usuario_id != usuario_logado.get("id"):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado")
        usuario = usuario_repo.buscar_por_id(usuario_id)
        if not usuario:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")
        
        usuario.nome = usuario_data.get("nome", usuario.nome)
        usuario.email = usuario_data.get("email", usuario.email)
        
        nova_senha = usuario_data.get("senha")
        if nova_senha:
            usuario.senha = criar_hash_senha(nova_senha)
            
        usuario_repo.atualizar(usuario)
        return JSONResponse({
            "id": usuario.id,
            "nome": usuario.nome,
            "email": usuario.email,
            "mensagem": "Usuário atualizado com sucesso"
        })
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Erro ao atualizar usuário: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# REMOVIDO: GET /usuario (listagem global de todos os usuários)
# Esse endpoint expunha nome + email de todos os usuários para qualquer pessoa autenticada.

@router.post("/auth/login")
async def login(request: Request, credenciais: dict = Body(...)):
    """Faz login de um usuário"""
    try:
        enforce_rate_limit(
            request,
            key="public:login",
            limit=get_limit_from_env("RATE_LIMIT_LOGIN", 10),
            window_seconds=60
        )
        enforce_captcha_if_enabled(request, credenciais)
        email = credenciais.get("email")
        senha = credenciais.get("senha")
        
        # Buscar usuário por email
        usuario = usuario_repo.buscar_por_email(email)

        if not usuario or not usuario.senha:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou senha incorretos"
            )

        if is_bcrypt_hash(usuario.senha):
            if not verificar_senha(senha, usuario.senha):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Email ou senha incorretos"
                )
        else:
            # Migrar senha legada em texto puro para bcrypt no primeiro login valido
            if senha != usuario.senha:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Email ou senha incorretos"
                )
            usuario.senha = criar_hash_senha(senha)
            usuario_repo.atualizar(usuario)
            
        usuario_dict = {
            "id": usuario.id,
            "nome": usuario.nome,
            "email": usuario.email
        }
        
        criar_sessao(request, usuario_dict)
        # REMOVIDO: auto-vinculação sem consentimento no login
        # O parceiro deve aceitar o convite explicitamente via POST /casal/{id}/aceitar-convite
        return JSONResponse({
            "usuario": usuario_dict,
            "mensagem": "Login realizado com sucesso"
        })
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Erro ao fazer login: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/auth/logout")
async def logout(request: Request):
    """Faz logout de um usuário"""
    destruir_sessao(request)
    return JSONResponse({"mensagem": "Logout realizado com sucesso"})

@router.get("/auth/me")
@requer_autenticacao()
async def me(request: Request, usuario_logado: dict = None):
    """Retorna dados do usuário autenticado"""
    return JSONResponse(usuario_logado)
