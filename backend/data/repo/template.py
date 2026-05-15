from typing import Optional
from util.database import get_connection
from backend.data.model.template import Template
from backend.data.sql.template_sql import *

def criar_tabela() -> bool:
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(CRIAR_TABELA)
            conn.commit()
            cursor.close()
            return True
    except Exception as e:
        print(f"Erro ao criar tabela Template: {e}")
        return False

def inserir(template: Template) -> Optional[int]:
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(INSERIR, (
                template.id_casal,
                template.foto_casal_vertical,
                template.foto_casal_horizontal,
                template.texto_casal,
                template.nomes_noivos,
                template.local_cerimonia,
                template.local_recepcao
            ))
            template_id = cursor.lastrowid
            conn.commit()
            cursor.close()
            return template_id
    except Exception as e:
        print(f"Erro ao inserir template: {e}")
        return None

def atualizar(template: Template) -> bool:
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(ATUALIZAR, (
                template.foto_casal_vertical,
                template.foto_casal_horizontal,
                template.texto_casal,
                template.nomes_noivos,
                template.local_cerimonia,
                template.local_recepcao,
                template.id_casal
            ))
            conn.commit()
            cursor.close()
            return True
    except Exception as e:
        print(f"Erro ao atualizar template: {e}")
        return False

def buscar_por_casal(id_casal: int) -> Optional[Template]:
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(BUSCAR_POR_CASAL, (id_casal,))
            resultado = cursor.fetchone()
            cursor.close()
            if resultado:
                return Template(
                    id=resultado[0],
                    id_casal=resultado[1],
                    foto_casal_vertical=resultado[2],
                    foto_casal_horizontal=resultado[3],
                    texto_casal=resultado[4],
                    nomes_noivos=resultado[5],
                    local_cerimonia=resultado[6],
                    local_recepcao=resultado[7]
                )
            return None
    except Exception as e:
        print(f"Erro ao buscar template por casal: {e}")
        return None

def buscar_por_id(template_id: int) -> Optional[Template]:
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(BUSCAR_POR_ID, (template_id,))
            resultado = cursor.fetchone()
            cursor.close()
            if resultado:
                return Template(
                    id=resultado[0],
                    id_casal=resultado[1],
                    foto_casal_vertical=resultado[2],
                    foto_casal_horizontal=resultado[3],
                    texto_casal=resultado[4],
                    nomes_noivos=resultado[5],
                    local_cerimonia=resultado[6],
                    local_recepcao=resultado[7]
                )
            return None
    except Exception as e:
        print(f"Erro ao buscar template por id: {e}")
        return None

def deletar(id_casal: int) -> bool:
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(DELETAR, (id_casal,))
            conn.commit()
            cursor.close()
            return True
    except Exception as e:
        print(f"Erro ao deletar template: {e}")
        return False
