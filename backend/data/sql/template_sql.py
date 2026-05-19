CRIAR_TABELA = """
CREATE TABLE IF NOT EXISTS Template (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_casal INT NOT NULL UNIQUE,
    slug VARCHAR(255) UNIQUE,
    foto_casal_vertical LONGTEXT,
    foto_casal_horizontal LONGTEXT,
    texto_casal LONGTEXT,
    nomes_noivos VARCHAR(255),
    local_cerimonia VARCHAR(500),
    local_recepcao VARCHAR(500),
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_casal) REFERENCES Casal(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;"""

INSERIR = """
INSERT INTO Template (
    id_casal,
    slug,
    foto_casal_vertical,
    foto_casal_horizontal,
    texto_casal,
    nomes_noivos,
    local_cerimonia,
    local_recepcao,
    is_public
)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
"""

ATUALIZAR = """
UPDATE Template
SET 
    slug = %s,
    foto_casal_vertical = %s,
    foto_casal_horizontal = %s,
    texto_casal = %s,
    nomes_noivos = %s,
    local_cerimonia = %s,
    local_recepcao = %s,
    is_public = %s
WHERE id_casal = %s;
"""

BUSCAR_POR_CASAL = """
SELECT id, id_casal, slug, foto_casal_vertical, foto_casal_horizontal, texto_casal,
       nomes_noivos, local_cerimonia, local_recepcao, is_public
FROM Template
WHERE id_casal = %s;
"""

BUSCAR_POR_ID = """
SELECT id, id_casal, slug, foto_casal_vertical, foto_casal_horizontal, texto_casal,
       nomes_noivos, local_cerimonia, local_recepcao, is_public
FROM Template
WHERE id = %s;
"""

BUSCAR_POR_SLUG = """
SELECT id, id_casal, slug, foto_casal_vertical, foto_casal_horizontal, texto_casal,
       nomes_noivos, local_cerimonia, local_recepcao, is_public
FROM Template
WHERE slug = %s;
"""

DELETAR = """
DELETE FROM Template
WHERE id_casal = %s;
"""

LISTAR_TODOS = """
SELECT id, id_casal, slug, foto_casal_vertical, foto_casal_horizontal, texto_casal,
       nomes_noivos, local_cerimonia, local_recepcao, is_public
FROM Template;
"""
