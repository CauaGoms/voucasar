#!/usr/bin/env python3
"""
Script para adicionar coluna tipo_chave_pix à tabela Casal
Executa: ALTER TABLE Casal ADD COLUMN tipo_chave_pix VARCHAR(50) DEFAULT 'aleatoria';
"""

from util.database import get_connection

def adicionar_coluna_tipo_chave_pix():
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            
            # Verificar se coluna já existe
            cursor.execute("""
                SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'Casal' AND COLUMN_NAME = 'tipo_chave_pix'
            """)
            
            if cursor.fetchone():
                print("✓ Coluna tipo_chave_pix já existe na tabela Casal")
                return True
            
            # Adicionar coluna
            cursor.execute("""
                ALTER TABLE Casal 
                ADD COLUMN tipo_chave_pix VARCHAR(50) DEFAULT 'aleatoria'
            """)
            conn.commit()
            print("✓ Coluna tipo_chave_pix adicionada com sucesso à tabela Casal")
            return True
            
    except Exception as e:
        print(f"✗ Erro ao adicionar coluna: {e}")
        return False

if __name__ == '__main__':
    sucesso = adicionar_coluna_tipo_chave_pix()
    exit(0 if sucesso else 1)
