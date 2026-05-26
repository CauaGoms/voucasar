from fastapi import APIRouter, Request, HTTPException, status
from fastapi.responses import JSONResponse
import logging
from util.auth_decorator import requer_autenticacao
from util.rate_limit import enforce_rate_limit, get_limit_from_env
from backend.data.model.presente import Presente
from backend.data.repo import presente as presente_repo
from backend.data.repo import casal as casal_repo

router = APIRouter(prefix="/presente", tags=["presente"])
logger = logging.getLogger(__name__)


def _verificar_membro_casal(casal_id: int, usuario_id: int):
    """Verifica se o usuário é membro do casal. Lança 403 se não for."""
    casal = casal_repo.buscar_por_id(casal_id)
    if not casal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Casal não encontrado")
    if casal.id_usuario_1 != usuario_id and casal.id_usuario_2 != usuario_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado: você não pertence a este casal")
    return casal

@router.get("/publico/casal/{casal_id}")
async def listar_presentes_publico_por_casal_endpoint(casal_id: int, request: Request):
    """Lista presentes de forma pública para convidados"""
    try:
        enforce_rate_limit(
            request,
            key="public:presentes",
            limit=get_limit_from_env("RATE_LIMIT_PUBLIC_READ", 60),
            window_seconds=60
        )
        presentes = presente_repo.listar_por_casal(casal_id)
        return JSONResponse([
            {
                "id": p.id,
                "id_casal": p.id_casal,
                "id_categoria": p.id_categoria,
                "titulo": p.titulo,
                "descricao": p.descricao,
                "valor_estimado": float(p.valor_estimado) if p.valor_estimado is not None else None,
                "status": p.status,
                "foto_url": p.foto_url,
                "link_produto": p.link_produto
            } for p in presentes
        ])
    except Exception as e:
        logger.error(f"Erro ao listar presentes públicos: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("")
@requer_autenticacao()
async def criar_presente(request: Request, usuario_logado: dict = None):
    """Cria um novo presente — somente membros do casal podem adicionar"""
    try:
        presente_data = await request.json()
        id_casal = presente_data.get("id_casal")
        if not id_casal:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="id_casal é obrigatório")

        # SEGURANÇA: Verifica que o usuário logado pertence ao casal (previne IDOR)
        _verificar_membro_casal(id_casal, usuario_logado.get("id"))

        presente = Presente(
            id=0,
            id_casal=id_casal,
            id_categoria=presente_data.get("id_categoria"),
            titulo=presente_data.get("titulo"),
            descricao=presente_data.get("descricao"),
            valor_estimado=presente_data.get("valor_estimado"),
            status=presente_data.get("status", "disponivel"),
            foto_url=presente_data.get("foto_url"),
            link_produto=presente_data.get("link_produto")
        )
        cod_presente = presente_repo.inserir(presente)
        return JSONResponse({
            "id": cod_presente,
            "id_casal": presente.id_casal,
            "id_categoria": presente.id_categoria,
            "titulo": presente.titulo,
            "descricao": presente.descricao,
            "valor_estimado": float(presente.valor_estimado) if presente.valor_estimado is not None else None,
            "status": presente.status,
            "foto_url": presente.foto_url,
            "link_produto": presente.link_produto,
            "mensagem": "Presente criado com sucesso"
        }, status_code=status.HTTP_201_CREATED)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Erro ao criar presente: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{presente_id}")
@requer_autenticacao()
async def buscar_presente_endpoint(presente_id: int, request: Request, usuario_logado: dict = None):
    """Busca um presente por ID — somente membros do casal podem acessar"""
    try:
        presente = presente_repo.buscar_por_id(presente_id)
        if not presente:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Presente não encontrado")

        # SEGURANÇA: Verifica que o usuário pertence ao casal deste presente (previne IDOR)
        _verificar_membro_casal(presente.id_casal, usuario_logado.get("id"))

        return JSONResponse({
            "id": presente.id,
            "id_casal": presente.id_casal,
            "id_categoria": presente.id_categoria,
            "titulo": presente.titulo,
            "descricao": presente.descricao,
            "valor_estimado": float(presente.valor_estimado) if presente.valor_estimado is not None else None,
            "status": presente.status,
            "foto_url": presente.foto_url,
            "link_produto": presente.link_produto
        })
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Erro ao buscar presente: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.put("/{presente_id}")
@requer_autenticacao()
async def atualizar_presente_endpoint(presente_id: int, request: Request, usuario_logado: dict = None):
    """Atualiza um presente — somente membros do casal podem editar"""
    try:
        presente_data = await request.json()
        presente = presente_repo.buscar_por_id(presente_id)
        if not presente:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Presente não encontrado")

        # SEGURANÇA: Verifica que o usuário pertence ao casal deste presente (previne IDOR)
        _verificar_membro_casal(presente.id_casal, usuario_logado.get("id"))

        presente.id_categoria = presente_data.get("id_categoria", presente.id_categoria)
        presente.titulo = presente_data.get("titulo", presente.titulo)
        presente.descricao = presente_data.get("descricao", presente.descricao)
        presente.valor_estimado = presente_data.get("valor_estimado", presente.valor_estimado)
        presente.status = presente_data.get("status", presente.status)
        
        if "foto_url" in presente_data:
            presente.foto_url = presente_data["foto_url"]
        if "link_produto" in presente_data:
            presente.link_produto = presente_data["link_produto"]
        
        presente_repo.atualizar(presente)
        return JSONResponse({
            "id": presente.id,
            "id_casal": presente.id_casal,
            "id_categoria": presente.id_categoria,
            "titulo": presente.titulo,
            "descricao": presente.descricao,
            "valor_estimado": float(presente.valor_estimado) if presente.valor_estimado is not None else None,
            "status": presente.status,
            "foto_url": presente.foto_url,
            "link_produto": presente.link_produto,
            "mensagem": "Presente atualizado com sucesso"
        })
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Erro ao atualizar presente: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.delete("/{presente_id}")
@requer_autenticacao()
async def deletar_presente_endpoint(presente_id: int, request: Request, usuario_logado: dict = None):
    """Deleta um presente — somente membros do casal podem deletar"""
    try:
        presente = presente_repo.buscar_por_id(presente_id)
        if not presente:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Presente não encontrado")

        # SEGURANÇA: Verifica que o usuário pertence ao casal deste presente (previne IDOR)
        _verificar_membro_casal(presente.id_casal, usuario_logado.get("id"))

        presente_repo.deletar(presente_id)
        return JSONResponse({"mensagem": "Presente deletado com sucesso"})
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Erro ao deletar presente: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/casal/{casal_id}")
@requer_autenticacao()
async def listar_presentes_por_casal_endpoint(casal_id: int, request: Request, usuario_logado: dict = None):
    """Lista presentes por casal — somente membros do casal podem acessar"""
    try:
        # SEGURANÇA: Verifica que o usuário pertence ao casal (previne IDOR)
        _verificar_membro_casal(casal_id, usuario_logado.get("id"))

        presentes = presente_repo.listar_por_casal(casal_id)
        return JSONResponse([
            {
                "id": p.id,
                "id_casal": p.id_casal,
                "id_categoria": p.id_categoria,
                "titulo": p.titulo,
                "descricao": p.descricao,
                "valor_estimado": float(p.valor_estimado) if p.valor_estimado is not None else None,
                "status": p.status,
                "foto_url": p.foto_url,
                "link_produto": p.link_produto
            } for p in presentes
        ])
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Erro ao listar presentes: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

