from fastapi import APIRouter, Request, HTTPException, status
from fastapi.responses import JSONResponse
import logging
from util.auth_decorator import requer_autenticacao
from util.rate_limit import enforce_rate_limit, get_limit_from_env
from backend.data.model.casal import Casal
from backend.data.repo import casal as casal_repo
from backend.data.repo import usuario as usuario_repo

router = APIRouter(prefix="/casal", tags=["casal"])
logger = logging.getLogger(__name__)

@router.post("")
@requer_autenticacao()
async def criar_casal(request: Request, usuario_logado: dict = None):
    """Cria um novo casal"""
    try:
        casal_data = await request.json()
        tipo_chave = casal_data.get("tipo_chave_pix", "aleatoria").lower()
        
        # Validar tipo de chave
        from util.pix import TIPOS_CHAVE_PIX_VALIDOS
        if tipo_chave not in TIPOS_CHAVE_PIX_VALIDOS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=f"Tipo de chave inválido. Tipos válidos: {', '.join(TIPOS_CHAVE_PIX_VALIDOS)}"
            )
        
        casal = Casal(
            id=0,
            id_usuario_1=usuario_logado.get("id"),  # Sempre usa o ID do usuário logado, nunca do body
            id_usuario_2=None,
            email_usuario_2=casal_data.get("email_usuario_2"),
            chave_pix=casal_data.get("chave_pix"),
            tipo_chave_pix=tipo_chave,
            data_casamento=casal_data.get("data_casamento")
        )
        cod_casal = casal_repo.inserir(casal)
        return JSONResponse({
            "id": cod_casal,
            "id_usuario_1": casal.id_usuario_1,
            "id_usuario_2": casal.id_usuario_2,
            "email_usuario_2": casal.email_usuario_2,
            "chave_pix": casal.chave_pix,
            "tipo_chave_pix": casal.tipo_chave_pix,
            "data_casamento": str(casal.data_casamento),
            "mensagem": "Casal criado com sucesso"
        }, status_code=status.HTTP_201_CREATED)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Erro ao criar casal: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{casal_id}")
@requer_autenticacao()
async def buscar_casal_endpoint(casal_id: int, request: Request, usuario_logado: dict = None):
    """Busca um casal por ID — somente membros do casal podem acessar"""
    try:
        casal = casal_repo.buscar_por_id(casal_id)
        if not casal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Casal não encontrado")
        # SEGURANÇA: Somente membros do casal podem ver os dados completos
        usuario_id = usuario_logado.get("id")
        if casal.id_usuario_1 != usuario_id and casal.id_usuario_2 != usuario_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado")
        return JSONResponse({
            "id": casal.id,
            "id_usuario_1": casal.id_usuario_1,
            "id_usuario_2": casal.id_usuario_2,
            "email_usuario_2": casal.email_usuario_2,
            "chave_pix": casal.chave_pix,
            "tipo_chave_pix": casal.tipo_chave_pix,
            "data_casamento": str(casal.data_casamento)
        })
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Erro ao buscar casal: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.put("/{casal_id}")
@requer_autenticacao()
async def atualizar_casal_endpoint(casal_id: int, request: Request, usuario_logado: dict = None):
    """Atualiza um casal — somente o criador (usuario_1) pode editar"""
    try:
        casal_data = await request.json()
        casal = casal_repo.buscar_por_id(casal_id)
        if not casal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Casal não encontrado")
        
        # SEGURANÇA: Somente o criador do casal pode editá-lo (previne IDOR)
        usuario_id = usuario_logado.get("id")
        if casal.id_usuario_1 != usuario_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado: somente o criador do casal pode editá-lo")
        
        # Validar tipo de chave se for fornecido
        if "tipo_chave_pix" in casal_data:
            tipo_chave = casal_data.get("tipo_chave_pix", "aleatoria").lower()
            from util.pix import TIPOS_CHAVE_PIX_VALIDOS
            if tipo_chave not in TIPOS_CHAVE_PIX_VALIDOS:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, 
                    detail=f"Tipo de chave inválido. Tipos válidos: {', '.join(TIPOS_CHAVE_PIX_VALIDOS)}"
                )
            casal.tipo_chave_pix = tipo_chave
        
        # SEGURANÇA: id_usuario_1 não pode ser alterado via body (fixado ao criador)
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
            "tipo_chave_pix": casal.tipo_chave_pix,
            "data_casamento": str(casal.data_casamento),
            "mensagem": "Casal atualizado com sucesso"
        })
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Erro ao atualizar casal: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.delete("/{casal_id}")
@requer_autenticacao()
async def deletar_casal_endpoint(casal_id: int, request: Request, usuario_logado: dict = None):
    """Deleta um casal — somente o criador pode deletar"""
    try:
        casal = casal_repo.buscar_por_id(casal_id)
        if not casal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Casal não encontrado")
        # SEGURANÇA: Somente o criador do casal pode deletá-lo (previne IDOR)
        if casal.id_usuario_1 != usuario_logado.get("id"):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado: somente o criador do casal pode deletá-lo")
        casal_repo.deletar(casal_id)
        return JSONResponse({"mensagem": "Casal deletado com sucesso"})
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Erro ao deletar casal: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.delete("/{casal_id}/parceiro")
@requer_autenticacao()
async def desvincular_parceiro_endpoint(casal_id: int, request: Request, usuario_logado: dict = None):
    """Remove a vinculação do parceiro(a) ao casal. Pode ser feito pelo criador ou pelo próprio parceiro."""
    try:
        casal = casal_repo.buscar_por_id(casal_id)
        if not casal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Casal não encontrado")

        usuario_id = usuario_logado.get("id")
        if casal.id_usuario_1 != usuario_id and casal.id_usuario_2 != usuario_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissão para desvincular este casal")

        desvinculou = casal_repo.desvincular_parceiro(casal_id, usuario_id)
        if not desvinculou:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nenhum parceiro vinculado para remover")

        return JSONResponse({"mensagem": "Parceiro(a) desvinculado(a) com sucesso"})
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Erro ao desvincular parceiro: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/{casal_id}/aceitar-convite")
@requer_autenticacao()
async def aceitar_convite_endpoint(casal_id: int, request: Request, usuario_logado: dict = None):
    """
    Parceiro aceita explicitamente o convite para se vincular ao casal.
    O e-mail do usuário logado deve coincidir com o email_usuario_2 cadastrado no casal.
    """
    try:
        casal = casal_repo.buscar_por_id(casal_id)
        if not casal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Casal não encontrado")

        # Verifica se já tem parceiro vinculado
        if casal.id_usuario_2 and casal.id_usuario_2 != 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Este casal já possui um parceiro vinculado")

        # SEGURANÇA: Verifica se o e-mail do usuário logado bate com o e-mail do convite
        if not casal.email_usuario_2:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nenhum convite pendente para este casal")

        if casal.email_usuario_2.lower() != usuario_logado.get("email", "").lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não foi convidado para este casal"
            )

        # Vincula o parceiro com consentimento explícito
        vinculou = casal_repo.vincular_por_email(casal.email_usuario_2, usuario_logado.get("id"))
        if not vinculou:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Falha ao vincular parceiro")

        logger.info(f"Parceiro {usuario_logado.get('email')} aceitou convite do casal {casal_id}")
        return JSONResponse({"mensagem": "Convite aceito com sucesso! Você foi vinculado ao casal."})
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Erro ao aceitar convite: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/publico/{casal_id}")
async def buscar_casal_publico(casal_id: int, request: Request):
    """Busca informações básicas de um casal publicamente"""
    try:
        enforce_rate_limit(
            request,
            key="public:casal",
            limit=get_limit_from_env("RATE_LIMIT_PUBLIC_READ", 60),
            window_seconds=60
        )
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

@router.get("/convites/pendentes")
@requer_autenticacao()
async def listar_convites_pendentes_endpoint(request: Request, usuario_logado: dict = None):
    """Lista convites de casamento pendentes para o usuário logado"""
    try:
        casais = casal_repo.buscar_convites_pendentes(usuario_logado.get("email"))
        return JSONResponse([
            {
                "id": c.id,
                "id_usuario_1": c.id_usuario_1,
                "email_usuario_2": c.email_usuario_2,
                "data_casamento": str(c.data_casamento)
            } for c in casais
        ])
    except Exception as e:
        logger.error(f"Erro ao buscar convites pendentes: {e}")
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
