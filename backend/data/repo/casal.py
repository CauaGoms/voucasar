from typing import Optional
from util.database import get_connection
from backend.data.model.casal import Casal
from backend.data.sql.casal_sql import *

def criar_tabela() -> bool:
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(CRIAR_TABELA)
            conn.commit()
            cursor.close()
            return True
    except Exception as e:
        print(f"Erro ao criar tabela Casal: {e}")
        return False

def inserir(casal: Casal, cursor=None) -> Optional[int]:
    if cursor is not None:
        cursor.execute(INSERIR, (
            casal.id_usuario_1,
            casal.id_usuario_2,
            casal.email_usuario_2,
            casal.chave_pix,
            casal.data_casamento
        ))
        return cursor.lastrowid
    else:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(INSERIR, (
                casal.id_usuario_1,
                casal.id_usuario_2,
                casal.email_usuario_2,
                casal.chave_pix,
                casal.data_casamento
            ))
            cod_casal = cursor.lastrowid
            conn.commit()
            cursor.close()
            return cod_casal
        
def deletar(cod_casal: int) -> bool:
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(DELETAR, (cod_casal,))
            conn.commit()
            cursor.close()
            return True
    except Exception as e:
        print(f"Erro ao deletar casal: {e}")
        return False

def listar_todos() -> list[Casal]:
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(LISTAR_TODOS)
            resultados = cursor.fetchall()
            cursor.close()
            casais = []
            for resultado in resultados:
                casais.append(Casal(
                    id=resultado[0],
                    id_usuario_1=resultado[1],
                    id_usuario_2=resultado[2],
                    email_usuario_2=resultado[3],
                    chave_pix=resultado[4],
                    data_casamento=resultado[5]
                ))
            return casais
    except Exception as e:
        print(f"Erro ao listar casais: {e}")
        return []

def listar_por_usuario(cod_usuario: int) -> list[Casal]:
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(LISTAR_POR_USUARIO, (cod_usuario, cod_usuario))
            resultados = cursor.fetchall()
            cursor.close()
            casais = []
            for resultado in resultados:
                casais.append(Casal(
                    id=resultado[0],
                    id_usuario_1=resultado[1],
                    id_usuario_2=resultado[2],
                    email_usuario_2=resultado[3],
                    chave_pix=resultado[4],
                    data_casamento=resultado[5]
                ))
            return casais
    except Exception as e:
        print(f"Erro ao listar casais por usuario: {e}")
        return []

def atualizar(casal: Casal) -> bool:
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(ATUALIZAR, (
                casal.id_usuario_1,
                casal.id_usuario_2,
                casal.email_usuario_2,
                casal.chave_pix,
                casal.data_casamento,
                casal.id
            ))
            conn.commit()
            cursor.close()
            return True
    except Exception as e:
        print(f"Erro ao atualizar casal: {e}")
        return False

def buscar_por_id(cod_casal: int) -> Optional[Casal]:
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(BUSCAR_POR_ID, (cod_casal,))
            resultado = cursor.fetchone()
            cursor.close()
            if resultado:
                return Casal(
                    id=resultado[0],
                    id_usuario_1=resultado[1],
                    id_usuario_2=resultado[2],
                    email_usuario_2=resultado[3],
                    chave_pix=resultado[4],
                    data_casamento=resultado[5]
                )
            return None
    except Exception as e:
        print(f"Erro ao buscar casal por id: {e}")
        return None