import sys
import os
import base64
from io import BytesIO
from PIL import Image
import logging

# Adicionar o diretório raiz ao path para encontrar o módulo util
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from util.database import get_connection

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MAX_WIDTH = 1200
MAX_HEIGHT = 1200
QUALITY = 70

def compress_base64_image(base64_string):
    if not base64_string or not base64_string.startswith('data:image'):
        return base64_string
        
    try:
        # Separar o cabeçalho (ex: "data:image/png;base64,") do conteúdo real
        header, encoded = base64_string.split(",", 1)
        image_data = base64.b64decode(encoded)
        
        img = Image.open(BytesIO(image_data))
        
        # Converter para RGB se necessário (remover transparência se for PNG para salvar como JPEG)
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
            
        width, height = img.size
        
        # Ignorar se a imagem já for pequena e leve (uma estimativa básica)
        if width <= MAX_WIDTH and height <= MAX_HEIGHT and len(encoded) < 500000:
            return base64_string

        # Calcular nova dimensão
        if width > height:
            if width > MAX_WIDTH:
                height = int((height * MAX_WIDTH) / width)
                width = MAX_WIDTH
        else:
            if height > MAX_HEIGHT:
                width = int((width * MAX_HEIGHT) / height)
                height = MAX_HEIGHT
                
        img = img.resize((width, height), Image.Resampling.LANCZOS)
        
        # Salvar em buffer
        buffer = BytesIO()
        img.save(buffer, format="JPEG", quality=QUALITY)
        
        # Converter de volta para base64
        new_encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
        
        return f"data:image/jpeg;base64,{new_encoded}"
    except Exception as e:
        logger.error(f"Erro ao comprimir imagem: {e}")
        return base64_string

def migrate():
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            
            logger.info("Buscando templates com fotos...")
            cursor.execute("SELECT id, foto_casal_vertical, foto_casal_horizontal FROM Template")
            templates = cursor.fetchall()
            
            for template in templates:
                t_id, foto_v, foto_h = template
                atualizou = False
                
                new_foto_v = foto_v
                if foto_v and foto_v.startswith('data:image') and len(foto_v) > 500000: # Maior que ~375KB original
                    logger.info(f"Comprimindo foto vertical do template {t_id}...")
                    new_foto_v = compress_base64_image(foto_v)
                    if new_foto_v != foto_v:
                        atualizou = True
                        
                new_foto_h = foto_h
                if foto_h and foto_h.startswith('data:image') and len(foto_h) > 500000: # Maior que ~375KB original
                    logger.info(f"Comprimindo foto horizontal do template {t_id}...")
                    new_foto_h = compress_base64_image(foto_h)
                    if new_foto_h != foto_h:
                        atualizou = True
                        
                if atualizou:
                    logger.info(f"Atualizando imagens comprimidas no banco para o template {t_id}")
                    cursor.execute("""
                        UPDATE Template 
                        SET foto_casal_vertical = %s, foto_casal_horizontal = %s 
                        WHERE id = %s
                    """, (new_foto_v, new_foto_h, t_id))
                    conn.commit()
            
            logger.info("✅ Fim da compressão das imagens antigas!")
            cursor.close()
    except Exception as e:
        logger.error(f"❌ Erro na migração: {e}")

if __name__ == "__main__":
    migrate()