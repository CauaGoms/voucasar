from fastapi import APIRouter, Request, Body, HTTPException, status
from fastapi.responses import JSONResponse
import logging
from util.auth_decorator import requer_autenticacao
from backend.data.model.fonte_compra import FonteCompra
from backend.data.repo import fonte_compra as fonte_compra_repo
from backend.data.repo import presente as presente_repo
from backend.data.repo import casal as casal_repo

router = APIRouter(prefix="/fonte-compra", tags=["fonte-compra"])
logger = logging.getLogger(__name__)


def _verificar_membro_casal_via_presente(presente_id: int, usuario_id: int):
    """Verifica ownership através do presente → casal. Lança 403 se não for membro."""
    presente = presente_repo.buscar_por_id(presente_id)
    if not presente:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Presente não encontrado")
    casal = casal_repo.buscar_por_id(presente.id_casal)
    if not casal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Casal não encontrado")
    if casal.id_usuario_1 != usuario_id and casal.id_usuario_2 != usuario_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado: você não pertence a este casal")
    return presente

@router.post("")
@requer_autenticacao()
async def criar_fonte_compra(request: Request, fonte_data: dict = Body(...), usuario_logado: dict = None):
    """Cria uma nova fonte de compra — somente membros do casal podem adicionar"""
    try:
        id_presente = fonte_data.get("id_presente")
        if not id_presente:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="id_presente é obrigatório")

        # SEGURANÇA: Verifica que o usuário pertence ao casal deste presente (previne IDOR)
        _verificar_membro_casal_via_presente(id_presente, usuario_logado.get("id"))

        fonte = FonteCompra(
            id=0,
            id_presente=id_presente,
            tipo=fonte_data.get("tipo"),
            url_externa=fonte_data.get("url_externa")
        )
        cod_fonte = fonte_compra_repo.inserir(fonte)
        return JSONResponse({
            "id": cod_fonte,
            "id_presente": fonte.id_presente,
            "tipo": fonte.tipo,
            "url_externa": fonte.url_externa,
            "mensagem": "Fonte de compra criada com sucesso"
        }, status_code=status.HTTP_201_CREATED)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Erro ao criar fonte de compra: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{fonte_id}")
@requer_autenticacao()
async def buscar_fonte_compra_endpoint(fonte_id: int, request: Request, usuario_logado: dict = None):
    """Busca uma fonte de compra por ID — somente membros do casal podem acessar"""
    try:
        fonte = fonte_compra_repo.buscar_por_id(fonte_id)
        if not fonte:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fonte de compra não encontrada")

        # SEGURANÇA: Verifica que o usuário pertence ao casal (previne IDOR)
        _verificar_membro_casal_via_presente(fonte.id_presente, usuario_logado.get("id"))

        return JSONResponse({
            "id": fonte.id,
            "id_presente": fonte.id_presente,
            "tipo": fonte.tipo,
            "url_externa": fonte.url_externa
        })
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Erro ao buscar fonte de compra: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.put("/{fonte_id}")
@requer_autenticacao()
async def atualizar_fonte_compra_endpoint(fonte_id: int, request: Request, fonte_data: dict = Body(...), usuario_logado: dict = None):
    """Atualiza uma fonte de compra — somente membros do casal podem editar"""
    try:
        fonte = fonte_compra_repo.buscar_por_id(fonte_id)
        if not fonte:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fonte de compra não encontrada")

        # SEGURANÇA: Verifica que o usuário pertence ao casal (previne IDOR)
        _verificar_membro_casal_via_presente(fonte.id_presente, usuario_logado.get("id"))

        fonte.tipo = fonte_data.get("tipo", fonte.tipo)
        fonte.url_externa = fonte_data.get("url_externa", fonte.url_externa)
        
        fonte_compra_repo.atualizar(fonte)
        return JSONResponse({
            "id": fonte.id,
            "id_presente": fonte.id_presente,
            "tipo": fonte.tipo,
            "url_externa": fonte.url_externa,
            "mensagem": "Fonte de compra atualizada com sucesso"
        })
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Erro ao atualizar fonte de compra: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.delete("/{fonte_id}")
@requer_autenticacao()
async def deletar_fonte_compra_endpoint(fonte_id: int, request: Request, usuario_logado: dict = None):
    """Deleta uma fonte de compra — somente membros do casal podem deletar"""
    try:
        fonte = fonte_compra_repo.buscar_por_id(fonte_id)
        if not fonte:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fonte de compra não encontrada")

        # SEGURANÇA: Verifica que o usuário pertence ao casal (previne IDOR)
        _verificar_membro_casal_via_presente(fonte.id_presente, usuario_logado.get("id"))

        fonte_compra_repo.deletar(fonte_id)
        return JSONResponse({"mensagem": "Fonte de compra deletada com sucesso"})
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Erro ao deletar fonte de compra: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/presente/{presente_id}")
@requer_autenticacao()
async def listar_fontes_por_presente_endpoint(presente_id: int, request: Request, usuario_logado: dict = None):
    """Lista fontes de compra por presente — somente membros do casal podem acessar"""
    try:
        # SEGURANÇA: Verifica que o usuário pertence ao casal (previne IDOR)
        _verificar_membro_casal_via_presente(presente_id, usuario_logado.get("id"))

        fontes = fonte_compra_repo.listar_por_presente(presente_id)
        return JSONResponse([
            {
                "id": f.id,
                "id_presente": f.id_presente,
                "tipo": f.tipo,
                "url_externa": f.url_externa
            } for f in fontes
        ])
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Erro ao listar fontes de compra: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
