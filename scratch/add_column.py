import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from util.database import get_connection

def add_column():
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("ALTER TABLE Template ADD COLUMN is_public BOOLEAN DEFAULT TRUE;")
            conn.commit()
            print("Coluna is_public adicionada com sucesso.")
    except Exception as e:
        print(f"Erro: {e}")

if __name__ == '__main__':
    add_column()
