CRIAR_TABELA = """
CREATE TABLE IF NOT EXISTS Casal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario_1 INT,
    id_usuario_2 INT,
    chave_pix VARCHAR(255),
    data_casamento DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
"""

INSERIR = """
INSERT INTO Casal (
    id_usuario_1,
    id_usuario_2,
    chave_pix,
    data_casamento
)
VALUES (%s, %s, %s, %s);
"""

DELETAR = """
DELETE FROM Casal
WHERE id = %s;
"""

LISTAR_TODOS = """
SELECT id, id_usuario_1, id_usuario_2, chave_pix, data_casamento
FROM Casal;
"""

BUSCAR_POR_ID = """
SELECT id, id_usuario_1, id_usuario_2, chave_pix, data_casamento
FROM Casal
WHERE id = %s;
"""