from typing import Optional, List
from util.database import get_connection
from backend.data.model.presente import Presente
from backend.data.sql.presente_sql import *

def criar_tabela() -> bool:
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(CRIAR_TABELA)
            
            # Adiciona colunas novas caso não existam no banco existente
            try:
                cursor.execute("ALTER TABLE Presente ADD COLUMN foto_url TEXT")
            except Exception:
                pass
            try:
                cursor.execute("ALTER TABLE Presente ADD COLUMN link_produto TEXT")
            except Exception:
                pass
                
            conn.commit()
            cursor.close()
            return True
    except Exception as e:
        print(f"Erro ao criar tabela Presente: {e}")
        return False

def inserir(presente: Presente, cursor=None) -> Optional[int]:
    if cursor is not None:
        cursor.execute(INSERIR, (
            presente.id_casal,
            presente.id_categoria,
            presente.titulo,
            presente.descricao,
            presente.valor_estimado,
            presente.status,
            presente.foto_url,
            presente.link_produto
        ))
        return cursor.lastrowid
    else:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(INSERIR, (
                presente.id_casal,
                presente.id_categoria,
                presente.titulo,
                presente.descricao,
                presente.valor_estimado,
                presente.status,
                presente.foto_url,
                presente.link_produto
            ))
            cod_presente = cursor.lastrowid
            conn.commit()
            cursor.close()
            return cod_presente

def deletar(cod_presente: int) -> bool:
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            # Deleta registros dependentes para evitar erro de chave estrangeira
            cursor.execute("DELETE FROM TransacaoPresente WHERE id_presente = %s", (cod_presente,))
            cursor.execute("DELETE FROM FonteCompra WHERE id_presente = %s", (cod_presente,))
            cursor.execute(DELETAR, (cod_presente,))
            conn.commit()
            cursor.close()
            return True
    except Exception as e:
        print(f"Erro ao deletar presente: {e}")
        return False

def atualizar(presente: Presente) -> bool:
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(ATUALIZAR, (
                presente.id_casal,
                presente.id_categoria,
                presente.titulo,
                presente.descricao,
                presente.valor_estimado,
                presente.status,
                presente.foto_url,
                presente.link_produto,
                presente.id
            ))
            conn.commit()
            cursor.close()
            return True
    except Exception as e:
        print(f"Erro ao atualizar presente: {e}")
        return False

def buscar_por_id(cod_presente: int) -> Optional[Presente]:
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(BUSCAR_POR_ID, (cod_presente,))
            resultado = cursor.fetchone()
            cursor.close()
            if resultado:
                return Presente(
                    id=resultado[0],
                    id_casal=resultado[1],
                    id_categoria=resultado[2],
                    titulo=resultado[3],
                    descricao=resultado[4],
                    valor_estimado=resultado[5],
                    status=resultado[6],
                    foto_url=resultado[7] if len(resultado) > 7 else None,
                    link_produto=resultado[8] if len(resultado) > 8 else None
                )
            return None
    except Exception as e:
        print(f"Erro ao buscar presente por id: {e}")
        return None

def listar_por_casal(cod_casal: int) -> List[Presente]:
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(LISTAR_POR_CASAL, (cod_casal,))
            resultados = cursor.fetchall()
            cursor.close()
            presentes = []
            for resultado in resultados:
                presentes.append(Presente(
                    id=resultado[0],
                    id_casal=resultado[1],
                    id_categoria=resultado[2],
                    titulo=resultado[3],
                    descricao=resultado[4],
                    valor_estimado=resultado[5],
                    status=resultado[6],
                    foto_url=resultado[7] if len(resultado) > 7 else None,
                    link_produto=resultado[8] if len(resultado) > 8 else None
                ))
            return presentes
    except Exception as e:
        print(f"Erro ao listar presentes por casal: {e}")
        return []

def listar_todos() -> List[Presente]:
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(LISTAR_TODOS)
            resultados = cursor.fetchall()
            cursor.close()
            presentes = []
            for resultado in resultados:
                presentes.append(Presente(
                    id=resultado[0],
                    id_casal=resultado[1],
                    id_categoria=resultado[2],
                    titulo=resultado[3],
                    descricao=resultado[4],
                    valor_estimado=resultado[5],
                    status=resultado[6],
                    foto_url=resultado[7] if len(resultado) > 7 else None,
                    link_produto=resultado[8] if len(resultado) > 8 else None
                ))
            return presentes
    except Exception as e:
        print(f"Erro ao listar presentes: {e}")
        return []
