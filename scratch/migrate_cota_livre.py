import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from util.database import get_connection
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate():
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            
            logger.info("Alterando coluna id_presente para aceitar valores nulos (para a Cota Livre)...")
            cursor.execute("ALTER TABLE TransacaoPresente MODIFY id_presente INT NULL;")
            conn.commit()
            
            logger.info("✅ Tabela TransacaoPresente atualizada com sucesso!")
                
            cursor.close()
    except Exception as e:
        logger.error(f"❌ Erro na migração: {e}")

if __name__ == "__main__":
    migrate()