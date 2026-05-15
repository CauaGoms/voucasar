from fastapi import APIRouter, Request, HTTPException, status, UploadFile, File
from fastapi.responses import JSONResponse
import logging
import base64
from util.auth_decorator import requer_autenticacao
from backend.data.model.template import Template
from backend.data.repo import template as template_repo

router = APIRouter(prefix="/template", tags=["template"])
logger = logging.getLogger(__name__)

@router.post("/{casal_id}")
@requer_autenticacao()
async def criar_ou_atualizar_template(casal_id: int, request: Request, usuario_logado: dict = None):
    """Cria ou atualiza um template para um casal"""
    try:
        template_data = await request.json()
        # Verificar se template já existe
        template_existente = template_repo.buscar_por_casal(casal_id)
        
        template = Template(
            id=template_existente.id if template_existente else 0,
            id_casal=casal_id,
            foto_casal_vertical=template_data.get("foto_casal_vertical", ""),
            foto_casal_horizontal=template_data.get("foto_casal_horizontal", ""),
            texto_casal=template_data.get("texto_casal", ""),
            nomes_noivos=template_data.get("nomes_noivos", ""),
            local_cerimonia=template_data.get("local_cerimonia", ""),
            local_recepcao=template_data.get("local_recepcao", "")
        )
        
        if template_existente:
            template_repo.atualizar(template)
            return JSONResponse({
                "id": template_existente.id,
                "id_casal": casal_id,
                "mensagem": "Template atualizado com sucesso"
            }, status_code=status.HTTP_200_OK)
        else:
            template_id = template_repo.inserir(template)
            return JSONResponse({
                "id": template_id,
                "id_casal": casal_id,
                "mensagem": "Template criado com sucesso"
            }, status_code=status.HTTP_201_CREATED)
    except Exception as e:
        logger.error(f"Erro ao salvar template: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/publico/{casal_id}")
async def buscar_template_publico(casal_id: int):
    """Busca um template publicamente (sem autenticação) para exibir na página do casamento"""
    try:
        template = template_repo.buscar_por_casal(casal_id)
        if not template:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Casamento não encontrado")
        return JSONResponse({
            "id": template.id,
            "id_casal": template.id_casal,
            "foto_casal_vertical": template.foto_casal_vertical,
            "foto_casal_horizontal": template.foto_casal_horizontal,
            "texto_casal": template.texto_casal,
            "nomes_noivos": template.nomes_noivos,
            "local_cerimonia": template.local_cerimonia,
            "local_recepcao": template.local_recepcao
        })
    except Exception as e:
        logger.error(f"Erro ao buscar template público: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{casal_id}")
@requer_autenticacao()
async def buscar_template(casal_id: int, request: Request, usuario_logado: dict = None):
    """Busca um template pelo ID do casal"""
    try:
        template = template_repo.buscar_por_casal(casal_id)
        if not template:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template não encontrado")
        return JSONResponse({
            "id": template.id,
            "id_casal": template.id_casal,
            "foto_casal_vertical": template.foto_casal_vertical,
            "foto_casal_horizontal": template.foto_casal_horizontal,
            "texto_casal": template.texto_casal,
            "nomes_noivos": template.nomes_noivos,
            "local_cerimonia": template.local_cerimonia,
            "local_recepcao": template.local_recepcao
        })
    except Exception as e:
        logger.error(f"Erro ao buscar template: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.delete("/{casal_id}")
@requer_autenticacao()
async def deletar_template(casal_id: int, request: Request, usuario_logado: dict = None):
    """Deleta um template"""
    try:
        template_repo.deletar(casal_id)
        return JSONResponse({"mensagem": "Template deletado com sucesso"})
    except Exception as e:
        logger.error(f"Erro ao deletar template: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
