from util.database import get_connection

def fix_table():
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            # Permitir NULL em id_fonte_compra
            cursor.execute("ALTER TABLE TransacaoPresente MODIFY id_fonte_compra INT NULL")
            conn.commit()
            cursor.close()
            print("Tabela TransacaoPresente alterada com sucesso!")
    except Exception as e:
        print(f"Erro ao alterar tabela: {e}")

if __name__ == "__main__":
    fix_table()
