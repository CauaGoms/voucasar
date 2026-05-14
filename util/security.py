import secrets
import string
from datetime import datetime, timedelta
import bcrypt
import hashlib


def _prepare_password_for_bcrypt(senha: str) -> bytes:
        """
        Prepara a senha para consumo pelo bcrypt:
        - Se a senha em bytes tiver <=72 bytes, retorna os bytes da senha.
        - Se for maior, retorna o SHA-256 hexdigest em ASCII bytes (64 bytes),
            que é seguro para passar ao bcrypt.
        """
        senha_bytes = senha.encode("utf-8")
        if len(senha_bytes) <= 72:
                return senha_bytes
        # hexdigest -> ASCII str de 64 chars -> encode para bytes (64 bytes)
        return hashlib.sha256(senha_bytes).hexdigest().encode("ascii")


def criar_hash_senha(senha: str) -> str:
    """
    Cria um hash seguro da senha usando bcrypt
    
    Args:
        senha: Senha em texto plano
    
    Returns:
        Hash da senha
    """
    dado = _prepare_password_for_bcrypt(senha)
    hashed = bcrypt.hashpw(dado, bcrypt.gensalt())
    # Armazenamos como string utf-8
    return hashed.decode("utf-8")


def verificar_senha(senha_plana: str, senha_hash: str) -> bool:
    """
    Verifica se a senha em texto plano corresponde ao hash
    
    Args:
        senha_plana: Senha em texto plano
        senha_hash: Hash da senha armazenado no banco (pode ser bcrypt ou texto puro)
    """
    if not senha_hash:
        return False
    senha_plana = (senha_plana or "").strip()
    # Se o hash parece ser bcrypt (começa com $2b$ ou $2a$), usa bcrypt
    if senha_hash.startswith("$2b$") or senha_hash.startswith("$2a$"):
        dado = _prepare_password_for_bcrypt(senha_plana)
        return bcrypt.checkpw(dado, senha_hash.encode("utf-8"))
    # Senão, compara texto puro (usuários importados com senha em texto)
    return senha_plana == (senha_hash or "").strip()


def gerar_token_redefinicao(tamanho: int = 32) -> str:
    """
    Gera um token aleatório seguro para redefinição de senha
    
    Args:
        tamanho: Tamanho do token em caracteres
    
    Returns:
        Token aleatório
    """
    caracteres = string.ascii_letters + string.digits
    return ''.join(secrets.choice(caracteres) for _ in range(tamanho))


def obter_data_expiracao_token(horas: int = 24) -> str:
    """
    Calcula a data de expiração do token
    
    Args:
        horas: Número de horas de validade do token
    
    Returns:
        Data de expiração no formato ISO
    """
    expiracao = datetime.now() + timedelta(hours=horas)
    return expiracao.isoformat()


def validar_forca_senha(senha: str) -> tuple[bool, str]:
    """
    Valida se a senha atende aos requisitos mínimos de segurança
    
    Requisitos:
    - Mínimo 8 caracteres
    - Pelo menos 1 letra maiúscula
    - Pelo menos 1 letra minúscula
    - Pelo menos 1 número
    - Não pode ser senha comum
    
    Args:
        senha: Senha a ser validada
    
    Returns:
        Tupla (válida, mensagem de erro se inválida)
    """
    # Lista de senhas comuns que devem ser rejeitadas
    senhas_comuns = [
        "12345678", "password", "senha123", "admin123", "qwerty123",
        "abc12345", "Password1", "Senha123", "Welcome1", "Pass1234",
        "Teste123", "Usuario1", "Admin123!", "Senha@123"
    ]
    
    if senha and (senha in senhas_comuns or senha.lower() in [s.lower() for s in senhas_comuns]):
        return False, "Esta senha é muito comum. Escolha uma senha mais segura."
    
    if not senha or len(senha) < 8:
        return False, "A senha deve ter pelo menos 8 caracteres"
    
    if not any(c.isupper() for c in senha):
        return False, "A senha deve conter pelo menos uma letra maiúscula"
    
    if not any(c.islower() for c in senha):
        return False, "A senha deve conter pelo menos uma letra minúscula"
    
    if not any(c.isdigit() for c in senha):
        return False, "A senha deve conter pelo menos um número"
    
    # Opcional: validar caractere especial
    # caracteres_especiais = "!@#$%^&*()_+-=[]{}|;:,.<>?"
    # if not any(c in caracteres_especiais for c in senha):
    #     return False, "A senha deve conter pelo menos um caractere especial"
    
    return True, ""


def validar_senha_atualizada(senha: str) -> tuple[bool, str]:
    """
    Valida se a senha atende aos requisitos rigorosos para senhas permanentes
    (usado no primeiro acesso após senha temporária)
    
    Requisitos:
    - Mínimo 8 caracteres
    - Pelo menos 1 letra maiúscula
    - Pelo menos 1 letra minúscula
    - Pelo menos 1 número
    - Pelo menos 1 caractere especial
    - Não pode ser senha comum
    
    Args:
        senha: Senha a ser validada
    
    Returns:
        Tupla (válida, mensagem de erro se inválida)
    """
    # Lista de senhas comuns que devem ser rejeitadas
    senhas_comuns = [
        "12345678", "password", "senha123", "admin123", "qwerty123",
        "abc12345", "Password1", "Senha123", "Welcome1", "Pass1234",
        "Teste123", "Usuario1", "Admin123!", "Senha@123"
    ]
    
    if senha in senhas_comuns or senha.lower() in [s.lower() for s in senhas_comuns]:
        return False, "Esta senha é muito comum. Escolha uma senha mais segura."
    
    if len(senha) < 8:
        return False, "A senha deve ter pelo menos 8 caracteres"
    
    if not any(c.isupper() for c in senha):
        return False, "A senha deve conter pelo menos uma letra maiúscula"
    
    if not any(c.islower() for c in senha):
        return False, "A senha deve conter pelo menos uma letra minúscula"
    
    if not any(c.isdigit() for c in senha):
        return False, "A senha deve conter pelo menos um número"
    
    if not any(c in "!@#$%&*()_+-=[]{}|;:,.<>?" for c in senha):
        return False, "A senha deve conter pelo menos um caractere especial (!@#$%&*...)"
    
    return True, ""


def gerar_senha_aleatoria(tamanho: int = 8) -> str:
    """
    Gera uma senha aleatória segura
    
    Args:
        tamanho: Tamanho da senha
    
    Returns:
        Senha aleatória
    """
    caracteres = string.ascii_letters + string.digits + "!@#$%"
    senha = ''.join(secrets.choice(caracteres) for _ in range(tamanho))
    return senha