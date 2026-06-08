from fastapi import APIRouter, Request, Body, HTTPException, status
from fastapi.responses import JSONResponse
import logging
from util.auth_decorator import requer_autenticacao
from util.confirmacao import gerar_token_confirmacao, validar_token_confirmacao
from util.rate_limit import enforce_rate_limit, get_limit_from_env
from util.captcha import enforce_captcha_if_enabled
from backend.data.model.transacao_presente import TransacaoPresente
from backend.data.repo import transacao_presente as transacao_repo
from backend.data.repo import casal as casal_repo

router = APIRouter(prefix="/transacao-presente", tags=["transacao-presente"])
logger = logging.getLogger(__name__)


def _verificar_membro_casal(casal_id: int, usuario_id: int):
    """Verifica se o usuário é membro do casal. Lança 403 se não for."""
    casal = casal_repo.buscar_por_id(casal_id)
    if not casal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Casal não encontrado")
    if casal.id_usuario_1 != usuario_id and casal.id_usuario_2 != usuario_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado: você não pertence a este casal")
    return casal

@router.post("")
@requer_autenticacao()
async def criar_transacao_presente(request: Request, transacao_data: dict = Body(...), usuario_logado: dict = None):
    """Cria uma nova transação de presente"""
    try:
        transacao = TransacaoPresente(
            id=0,
            id_presente=transacao_data.get("id_presente"),
            id_fonte_compra=transacao_data.get("id_fonte_compra"),
            id_casal=transacao_data.get("id_casal"),
            id_convidado=transacao_data.get("id_convidado"),
            assinatura_remetente=transacao_data.get("assinatura_remetente"),
            status_pagamento=transacao_data.get("status_pagamento", "pendente")
        )
        cod_transacao = transacao_repo.inserir(transacao)
        return JSONResponse({
            "id": cod_transacao,
            "id_presente": transacao.id_presente,
            "id_fonte_compra": transacao.id_fonte_compra,
            "id_casal": transacao.id_casal,
            "id_convidado": transacao.id_convidado,
            "assinatura_remetente": transacao.assinatura_remetente,
            "status_pagamento": transacao.status_pagamento,
            "mensagem": "Transação criada com sucesso"
        }, status_code=status.HTTP_201_CREATED)
    except Exception as e:
        logger.error(f"Erro ao criar transação: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{transacao_id}")
@requer_autenticacao()
async def buscar_transacao_endpoint(transacao_id: int, request: Request, usuario_logado: dict = None):
    """Busca uma transação por ID — somente membros do casal podem acessar"""
    try:
        transacao = transacao_repo.buscar_por_id(transacao_id)
        if not transacao:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transação não encontrada")

        # SEGURANÇA: Verifica que o usuário pertence ao casal desta transação (previne IDOR)
        _verificar_membro_casal(transacao.id_casal, usuario_logado.get("id"))

        return JSONResponse({
            "id": transacao.id,
            "id_presente": transacao.id_presente,
            "id_fonte_compra": transacao.id_fonte_compra,
            "id_casal": transacao.id_casal,
            "id_convidado": transacao.id_convidado,
            "assinatura_remetente": transacao.assinatura_remetente,
            "status_pagamento": transacao.status_pagamento
        })
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Erro ao buscar transação: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.put("/{transacao_id}")
@requer_autenticacao()
async def atualizar_transacao_endpoint(transacao_id: int, request: Request, transacao_data: dict = Body(...), usuario_logado: dict = None):
    """Atualiza uma transação — somente membros do casal podem atualizar"""
    try:
        transacao = transacao_repo.buscar_por_id(transacao_id)
        if not transacao:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transação não encontrada")

        # SEGURANÇA: Verifica que o usuário pertence ao casal desta transação (previne IDOR)
        _verificar_membro_casal(transacao.id_casal, usuario_logado.get("id"))

        transacao.assinatura_remetente = transacao_data.get("assinatura_remetente", transacao.assinatura_remetente)
        transacao.status_pagamento = transacao_data.get("status_pagamento", transacao.status_pagamento)
        
        transacao_repo.atualizar(transacao)
        return JSONResponse({
            "id": transacao.id,
            "id_presente": transacao.id_presente,
            "id_fonte_compra": transacao.id_fonte_compra,
            "id_casal": transacao.id_casal,
            "id_convidado": transacao.id_convidado,
            "assinatura_remetente": transacao.assinatura_remetente,
            "status_pagamento": transacao.status_pagamento,
            "mensagem": "Transação atualizada com sucesso"
        })
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Erro ao atualizar transação: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.delete("/{transacao_id}")
@requer_autenticacao()
async def deletar_transacao_endpoint(transacao_id: int, request: Request, usuario_logado: dict = None):
    """Deleta uma transação — somente membros do casal podem deletar"""
    try:
        transacao = transacao_repo.buscar_por_id(transacao_id)
        if not transacao:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transação não encontrada")

        # SEGURANÇA: Verifica que o usuário pertence ao casal desta transação (previne IDOR)
        _verificar_membro_casal(transacao.id_casal, usuario_logado.get("id"))

        transacao_repo.deletar(transacao_id)
        return JSONResponse({"mensagem": "Transação deletada com sucesso"})
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Erro ao deletar transação: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/casal/{casal_id}")
@requer_autenticacao()
async def listar_transacoes_por_casal_endpoint(casal_id: int, request: Request, usuario_logado: dict = None):
    """Lista transações por casal — somente membros do casal podem acessar"""
    try:
        # SEGURANÇA: Verifica que o usuário pertence ao casal (previne IDOR)
        _verificar_membro_casal(casal_id, usuario_logado.get("id"))

        transacoes = transacao_repo.listar_por_casal(casal_id)
        return JSONResponse([
            {
                "id": t.id,
                "id_presente": t.id_presente,
                "id_fonte_compra": t.id_fonte_compra,
                "id_casal": t.id_casal,
                "id_convidado": t.id_convidado,
                "assinatura_remetente": t.assinatura_remetente,
                "status_pagamento": t.status_pagamento
            } for t in transacoes
        ])
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Erro ao listar transações por casal: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/convidado/{convidado_id}")
@requer_autenticacao()
async def listar_transacoes_por_convidado_endpoint(convidado_id: int, request: Request, usuario_logado: dict = None):
    """Lista transações por convidado"""
    try:
        transacoes = transacao_repo.listar_por_convidado(convidado_id)
        return JSONResponse([
            {
                "id": t.id,
                "id_presente": t.id_presente,
                "id_fonte_compra": t.id_fonte_compra,
                "id_casal": t.id_casal,
                "id_convidado": t.id_convidado,
                "assinatura_remetente": t.assinatura_remetente,
                "status_pagamento": t.status_pagamento
            } for t in transacoes
        ])
    except Exception as e:
        logger.error(f"Erro ao listar transações por convidado: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
@router.post("/publico")
async def criar_transacao_publico(request: Request, transacao_data: dict = Body(...)):
    """Cria uma transação de presente publicamente (para convidados)"""
    try:
        enforce_rate_limit(
            request,
            key="public:transacao",
            limit=get_limit_from_env("RATE_LIMIT_PUBLIC_WRITE", 10),
            window_seconds=60
        )
        enforce_captcha_if_enabled(request, transacao_data)
        from backend.data.repo import usuario as usuario_repo
        from backend.data.repo import casal as casal_repo
        from backend.data.model.usuario import Usuario
        from util.security import criar_hash_senha
        import uuid

        nome = transacao_data.get("nome_convidado")
        email = transacao_data.get("email_convidado")
        id_presente = transacao_data.get("id_presente")
        id_casal = transacao_data.get("id_casal")

        if not nome or not email or not id_presente or not id_casal:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Dados incompletos")

        # Verificar se usuário convidado já existe
        usuario = usuario_repo.buscar_por_email(email)
        if not usuario:
            # Criar usuário "fantasma" para o convidado
            # Senha aleatória já que ele não vai logar convencionalmente agora
            senha_aleatoria = str(uuid.uuid4())
            usuario = Usuario(
                id=0,
                nome=nome,
                email=email,
                senha=criar_hash_senha(senha_aleatoria)
            )
            id_convidado = usuario_repo.inserir(usuario)
        else:
            id_convidado = usuario.id

        # Criar a transação
        transacao = TransacaoPresente(
            id=0,
            id_presente=id_presente,
            id_fonte_compra=None, 
            id_casal=id_casal,
            id_convidado=id_convidado,
            assinatura_remetente=nome,
            status_pagamento="pendente"
        )
        cod_transacao = transacao_repo.inserir(transacao)

        # Buscar chave PIX do casal e o presente
        casal = casal_repo.buscar_por_id(id_casal)
        
        from backend.data.repo import presente as presente_repo
        presente = presente_repo.buscar_por_id(id_presente)
        
        # O PRESENTE NÃO MUDA DE STATUS PARA QUE OUTROS POSSAM CONTRIBUIR
            
        valor_estimado = presente.valor_estimado if presente else 0
        
        payload_pix = ""
        qr_code_base64 = ""
        
        if casal and casal.chave_pix:
            try:
                from util.pix import gerar_payload_pix, gerar_qr_code_base64
                txid = f"VCASAR{cod_transacao:04d}"
                payload_pix = gerar_payload_pix(
                    chave_pix=casal.chave_pix,
                    tipo_chave_pix=casal.tipo_chave_pix,
                    valor=valor_estimado,
                    nome_recebedor="Casamento",
                    cidade_recebedor="Brasil",
                    txid=txid
                )
                qr_code_base64 = gerar_qr_code_base64(payload_pix)
            except Exception as e:
                logger.error(f"Erro ao gerar PIX: {e}")
        
        confirmacao_token = gerar_token_confirmacao(cod_transacao)
        return JSONResponse({
            "id": cod_transacao,
            "chave_pix": casal.chave_pix if casal else "",
            "payload_pix": payload_pix,
            "qr_code_base64": qr_code_base64,
            "valor": float(valor_estimado) if valor_estimado else 0.0,
            "confirmacao_token": confirmacao_token,
            "mensagem": "Transação iniciada. Por favor, realize o pagamento via PIX."
        }, status_code=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Erro ao criar transação pública: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/publico/cota-livre")
async def criar_cota_livre_publico(request: Request, data: dict = Body(...)):
    """Gera um PIX com valor customizado para Cota Livre e registra no banco"""
    try:
        enforce_rate_limit(
            request,
            key="public:cota_livre",
            limit=get_limit_from_env("RATE_LIMIT_PUBLIC_WRITE", 10),
            window_seconds=60
        )
        enforce_captcha_if_enabled(request, data)
        from backend.data.repo import casal as casal_repo
        from backend.data.repo import usuario as usuario_repo
        from backend.data.model.usuario import Usuario
        from util.security import criar_hash_senha
        import uuid
        from util.pix import gerar_payload_pix, gerar_qr_code_base64
        
        id_casal = data.get("id_casal")
        valor = data.get("valor")
        nome = data.get("nome_convidado")
        email = data.get("email_convidado")
        
        if not id_casal or not valor or not nome or not email:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Dados incompletos")
            
        casal = casal_repo.buscar_por_id(id_casal)
        if not casal or not casal.chave_pix:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Casal ou chave PIX não encontrado")
            
        # Verificar se usuário convidado já existe
        usuario = usuario_repo.buscar_por_email(email)
        if not usuario:
            senha_aleatoria = str(uuid.uuid4())
            usuario = Usuario(
                id=0,
                nome=nome,
                email=email,
                senha=criar_hash_senha(senha_aleatoria)
            )
            id_convidado = usuario_repo.inserir(usuario)
        else:
            id_convidado = usuario.id

        # Criar a transação (id_presente = None para cota livre)
        transacao = TransacaoPresente(
            id=0,
            id_presente=None,
            id_fonte_compra=None, 
            id_casal=id_casal,
            id_convidado=id_convidado,
            assinatura_remetente=f"{nome} (Cota Livre R${valor})",
            status_pagamento="pendente"
        )
        cod_transacao = transacao_repo.inserir(transacao)

        txid = f"COTA{cod_transacao:04d}"
        
        payload_pix = gerar_payload_pix(
            chave_pix=casal.chave_pix,
            tipo_chave_pix=casal.tipo_chave_pix,
            valor=float(valor),
            nome_recebedor="Casamento",
            cidade_recebedor="Brasil",
            txid=txid
        )
        qr_code_base64 = gerar_qr_code_base64(payload_pix)
        
        confirmacao_token = gerar_token_confirmacao(cod_transacao)
        return JSONResponse({
            "id": cod_transacao,
            "chave_pix": casal.chave_pix,
            "payload_pix": payload_pix,
            "qr_code_base64": qr_code_base64,
            "valor": float(valor),
            "confirmacao_token": confirmacao_token
        })
    except Exception as e:
        logger.error(f"Erro ao gerar cota livre PIX: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/publico/{transacao_id}/confirmar")
async def confirmar_pagamento_publico(transacao_id: int, request: Request, data: dict = Body(default=None)):
    """Marca que o convidado confirmou ter realizado o pagamento"""
    try:
        enforce_rate_limit(
            request,
            key="public:confirmar_pagamento",
            limit=get_limit_from_env("RATE_LIMIT_PUBLIC_CONFIRM", 5),
            window_seconds=60
        )
        enforce_captcha_if_enabled(request, data)
        token = request.headers.get("X-Confirm-Token")
        if not token:
            token = (data or {}).get("token")
        if not token:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token de confirmacao ausente")

        if not validar_token_confirmacao(token, transacao_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Token de confirmacao invalido ou expirado")

        transacao = transacao_repo.buscar_por_id(transacao_id)
        if not transacao:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transação não encontrada")

        if transacao.status_pagamento == "pago":
            return JSONResponse({"mensagem": "Pagamento ja confirmado"})
        
        transacao.status_pagamento = "pago"
        transacao_repo.atualizar(transacao)
        
        return JSONResponse({"mensagem": "Pagamento confirmado com sucesso!"})
    except Exception as e:
        logger.error(f"Erro ao confirmar pagamento: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
