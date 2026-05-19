from fastapi import APIRouter, Request, HTTPException, status
from fastapi.responses import JSONResponse
import logging
from util.auth_decorator import requer_autenticacao
from backend.data.model.casal import Casal
from backend.data.repo import casal as casal_repo

router = APIRouter(prefix="/casal", tags=["casal"])
logger = logging.getLogger(__name__)

@router.get("/publico/{casal_id}")
async def buscar_casal_publico(casal_id: int):
    """Busca informações básicas de um casal publicamente"""
    try:
        casal = casal_repo.buscar_por_id(casal_id)
        if not casal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Casal não encontrado")
        return JSONResponse({
            "id": casal.id,
            "data_casamento": str(casal.data_casamento),
            "chave_pix": casal.chave_pix,
        })
    except Exception as e:
        logger.error(f"Erro ao buscar casal público: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("")
@requer_autenticacao()
async def criar_casal(request: Request, usuario_logado: dict = None):
    """Cria um novo casal"""
    try:
        casal_data = await request.json()
        casal = Casal(
            id=0,
            id_usuario_1=casal_data.get("id_usuario_1"),
            id_usuario_2=casal_data.get("id_usuario_2"),
            email_usuario_2=casal_data.get("email_usuario_2"),
            chave_pix=casal_data.get("chave_pix"),
            data_casamento=casal_data.get("data_casamento")
        )
        cod_casal = casal_repo.inserir(casal)
        return JSONResponse({
            "id": cod_casal,
            "id_usuario_1": casal.id_usuario_1,
            "id_usuario_2": casal.id_usuario_2,
            "email_usuario_2": casal.email_usuario_2,
            "chave_pix": casal.chave_pix,
            "data_casamento": str(casal.data_casamento),
            "mensagem": "Casal criado com sucesso"
        }, status_code=status.HTTP_201_CREATED)
    except Exception as e:
        logger.error(f"Erro ao criar casal: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{casal_id}")
@requer_autenticacao()
async def buscar_casal_endpoint(casal_id: int, request: Request, usuario_logado: dict = None):
    """Busca um casal por ID"""
    try:
        casal = casal_repo.buscar_por_id(casal_id)
        if not casal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Casal não encontrado")
        return JSONResponse({
            "id": casal.id,
            "id_usuario_1": casal.id_usuario_1,
            "id_usuario_2": casal.id_usuario_2,
            "email_usuario_2": casal.email_usuario_2,
            "chave_pix": casal.chave_pix,
            "data_casamento": str(casal.data_casamento)
        })
    except Exception as e:
        logger.error(f"Erro ao buscar casal: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.put("/{casal_id}")
@requer_autenticacao()
async def atualizar_casal_endpoint(casal_id: int, request: Request, usuario_logado: dict = None):
    """Atualiza um casal"""
    try:
        casal_data = await request.json()
        casal = casal_repo.buscar_por_id(casal_id)
        if not casal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Casal não encontrado")
        
        casal.id_usuario_1 = casal_data.get("id_usuario_1", casal.id_usuario_1)
        casal.id_usuario_2 = casal_data.get("id_usuario_2", casal.id_usuario_2)
        casal.email_usuario_2 = casal_data.get("email_usuario_2", casal.email_usuario_2)
        casal.chave_pix = casal_data.get("chave_pix", casal.chave_pix)
        casal.data_casamento = casal_data.get("data_casamento", casal.data_casamento)
        
        casal_repo.atualizar(casal)
        return JSONResponse({
            "id": casal.id,
            "id_usuario_1": casal.id_usuario_1,
            "id_usuario_2": casal.id_usuario_2,
            "email_usuario_2": casal.email_usuario_2,
            "chave_pix": casal.chave_pix,
            "data_casamento": str(casal.data_casamento),
            "mensagem": "Casal atualizado com sucesso"
        })
    except Exception as e:
        logger.error(f"Erro ao atualizar casal: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.delete("/{casal_id}")
@requer_autenticacao()
async def deletar_casal_endpoint(casal_id: int, request: Request, usuario_logado: dict = None):
    """Deleta um casal"""
    try:
        casal_repo.deletar(casal_id)
        return JSONResponse({"mensagem": "Casal deletado com sucesso"})
    except Exception as e:
        logger.error(f"Erro ao deletar casal: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("")
@requer_autenticacao()
async def listar_casais_endpoint(request: Request, usuario_logado: dict = None):
    """Lista os casais associados ao usuário logado"""
    try:
        casais = casal_repo.listar_por_usuario(usuario_logado.get("id"))
        return JSONResponse([
            {
                "id": c.id,
                "id_usuario_1": c.id_usuario_1,
                "id_usuario_2": c.id_usuario_2,
                "email_usuario_2": c.email_usuario_2,
                "chave_pix": c.chave_pix,
                "data_casamento": str(c.data_casamento)
            } for c in casais
        ])
    except Exception as e:
        logger.error(f"Erro ao listar casais: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
