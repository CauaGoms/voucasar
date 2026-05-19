from fastapi import APIRouter, Request, HTTPException, status
from fastapi.responses import JSONResponse
import logging
from util.auth_decorator import requer_autenticacao
from backend.data.model.presente import Presente
from backend.data.repo import presente as presente_repo

router = APIRouter(prefix="/presente", tags=["presente"])
logger = logging.getLogger(__name__)

@router.get("/publico/casal/{casal_id}")
async def listar_presentes_publico_por_casal_endpoint(casal_id: int):
    """Lista presentes de forma pública para convidados"""
    try:
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
    """Cria um novo presente"""
    try:
        presente_data = await request.json()
        presente = Presente(
            id=0,
            id_casal=presente_data.get("id_casal"),
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
    except Exception as e:
        logger.error(f"Erro ao criar presente: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{presente_id}")
@requer_autenticacao()
async def buscar_presente_endpoint(presente_id: int, request: Request, usuario_logado: dict = None):
    """Busca um presente por ID"""
    try:
        presente = presente_repo.buscar_por_id(presente_id)
        if not presente:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Presente não encontrado")
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
    except Exception as e:
        logger.error(f"Erro ao buscar presente: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.put("/{presente_id}")
@requer_autenticacao()
async def atualizar_presente_endpoint(presente_id: int, request: Request, usuario_logado: dict = None):
    """Atualiza um presente"""
    try:
        presente_data = await request.json()
        presente = presente_repo.buscar_por_id(presente_id)
        if not presente:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Presente não encontrado")
        
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
    except Exception as e:
        logger.error(f"Erro ao atualizar presente: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.delete("/{presente_id}")
@requer_autenticacao()
async def deletar_presente_endpoint(presente_id: int, request: Request, usuario_logado: dict = None):
    """Deleta um presente"""
    try:
        presente_repo.deletar(presente_id)
        return JSONResponse({"mensagem": "Presente deletado com sucesso"})
    except Exception as e:
        logger.error(f"Erro ao deletar presente: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/casal/{casal_id}")
@requer_autenticacao()
async def listar_presentes_por_casal_endpoint(casal_id: int, request: Request, usuario_logado: dict = None):
    """Lista presentes por casal"""
    try:
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
        logger.error(f"Erro ao listar presentes: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

