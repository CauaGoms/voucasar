from fastapi import APIRouter, Request, HTTPException, status, UploadFile, File
from fastapi.responses import JSONResponse
import logging
import base64
import unicodedata
import re
import secrets
import string
from util.auth_decorator import requer_autenticacao
from backend.data.model.template import Template
from backend.data.repo import template as template_repo

router = APIRouter(prefix="/template", tags=["template"])
logger = logging.getLogger(__name__)

def gerar_slug_unico(texto: str) -> str:
    """Gera um slug amigável com um sufixo aleatório para garantir unicidade"""
    if not texto:
        texto = "casamento"
    
    # Limpar texto
    texto = unicodedata.normalize('NFKD', texto).encode('ascii', 'ignore').decode('utf-8')
    texto = texto.lower()
    texto = re.sub(r'[^a-z0-9\-]', '-', texto)
    texto = re.sub(r'-+', '-', texto)
    base_slug = texto.strip('-')
    
    # Adicionar sufixo aleatório (4 caracteres)
    sufixo = ''.join(secrets.choice(string.ascii_lowercase + string.digits) for _ in range(4))
    return f"{base_slug}-{sufixo}"

@router.post("/{casal_id}")
@requer_autenticacao()
async def criar_ou_atualizar_template(casal_id: int, request: Request, usuario_logado: dict = None):
    """Cria ou atualiza um template para um casal"""
    try:
        template_data = await request.json()
        # Verificar se template já existe
        template_existente = template_repo.buscar_por_casal(casal_id)
        
        nomes_noivos = template_data.get("nomes_noivos", "")
        
        # Gerar novo slug apenas se for criação ou se os nomes mudaram significativamente
        if template_existente:
            slug = template_existente.slug
            # Se mudou os nomes e não tinha slug antes, gera um
            if not slug or (nomes_noivos and template_existente.nomes_noivos != nomes_noivos):
                slug = gerar_slug_unico(nomes_noivos)
        else:
            slug = gerar_slug_unico(nomes_noivos)
        
        template = Template(
            id=template_existente.id if template_existente else 0,
            id_casal=casal_id,
            slug=slug,
            foto_casal_vertical=template_data.get("foto_casal_vertical", ""),
            foto_casal_horizontal=template_data.get("foto_casal_horizontal", ""),
            texto_casal=template_data.get("texto_casal", ""),
            nomes_noivos=nomes_noivos,
            local_cerimonia=template_data.get("local_cerimonia", ""),
            local_recepcao=template_data.get("local_recepcao", ""),
            is_public=template_data.get("is_public", True)
        )
        
        if template_existente:
            template_repo.atualizar(template)
            return JSONResponse({
                "id": template_existente.id,
                "id_casal": casal_id,
                "slug": slug,
                "mensagem": "Template atualizado com sucesso"
            }, status_code=status.HTTP_200_OK)
        else:
            template_id = template_repo.inserir(template)
            return JSONResponse({
                "id": template_id,
                "id_casal": casal_id,
                "slug": slug,
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
        if not template or not template.is_public:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Casamento não encontrado ou privado")
        return JSONResponse({
            "id": template.id,
            "id_casal": template.id_casal,
            "slug": template.slug,
            "foto_casal_vertical": template.foto_casal_vertical,
            "foto_casal_horizontal": template.foto_casal_horizontal,
            "texto_casal": template.texto_casal,
            "nomes_noivos": template.nomes_noivos,
            "local_cerimonia": template.local_cerimonia,
            "local_recepcao": template.local_recepcao,
            "is_public": template.is_public
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
            "slug": template.slug,
            "foto_casal_vertical": template.foto_casal_vertical,
            "foto_casal_horizontal": template.foto_casal_horizontal,
            "texto_casal": template.texto_casal,
            "nomes_noivos": template.nomes_noivos,
            "local_cerimonia": template.local_cerimonia,
            "local_recepcao": template.local_recepcao,
            "is_public": template.is_public
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

@router.get("/publico/slug/{slug}")
async def buscar_template_por_slug(slug: str):
    """Busca o template de um casal pelo slug único"""
    try:
        # Primeiro busca pelo campo slug exato no banco
        t = template_repo.buscar_por_slug(slug)
        if t and t.is_public:
            return JSONResponse({
                "id": t.id,
                "id_casal": t.id_casal,
                "slug": t.slug,
                "foto_casal_vertical": t.foto_casal_vertical,
                "foto_casal_horizontal": t.foto_casal_horizontal,
                "texto_casal": t.texto_casal,
                "nomes_noivos": t.nomes_noivos,
                "local_cerimonia": t.local_cerimonia,
                "local_recepcao": t.local_recepcao,
                "is_public": t.is_public
            })

        # Fallback para ID se for numérico
        try:
            casal_id = int(slug)
            t = template_repo.buscar_por_casal(casal_id)
            if t and t.is_public:
                return JSONResponse({
                    "id": t.id,
                    "id_casal": t.id_casal,
                    "slug": t.slug,
                    "foto_casal_vertical": t.foto_casal_vertical,
                    "foto_casal_horizontal": t.foto_casal_horizontal,
                    "texto_casal": t.texto_casal,
                    "nomes_noivos": t.nomes_noivos,
                    "local_cerimonia": t.local_cerimonia,
                    "local_recepcao": t.local_recepcao,
                    "is_public": t.is_public
                })
        except ValueError:
            pass

        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Casamento não encontrado")
    except Exception as e:
        logger.error(f"Erro ao buscar template por slug: {e}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
