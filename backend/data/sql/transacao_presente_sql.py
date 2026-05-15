CRIAR_TABELA = """
CREATE TABLE IF NOT EXISTS TransacaoPresente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_presente INT NOT NULL,
    id_fonte_compra INT NULL,
    id_casal INT NOT NULL,
    id_convidado INT NOT NULL,
    assinatura_remetente VARCHAR(255),
    status_pagamento VARCHAR(50),
    FOREIGN KEY (id_presente) REFERENCES Presente(id),
    FOREIGN KEY (id_fonte_compra) REFERENCES FonteCompra(id),
    FOREIGN KEY (id_casal) REFERENCES Casal(id),
    FOREIGN KEY (id_convidado) REFERENCES Usuario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
"""

INSERIR = """
INSERT INTO TransacaoPresente (
    id_presente,
    id_fonte_compra,
    id_casal,
    id_convidado,
    assinatura_remetente,
    status_pagamento
)
VALUES (%s, %s, %s, %s, %s, %s);
"""

DELETAR = """
DELETE FROM TransacaoPresente
WHERE id = %s;
"""

ATUALIZAR = """
UPDATE TransacaoPresente
SET id_presente = %s, id_fonte_compra = %s, id_casal = %s, id_convidado = %s, assinatura_remetente = %s, status_pagamento = %s
WHERE id = %s;
"""

BUSCAR_POR_ID = """
SELECT id, id_presente, id_fonte_compra, id_casal, id_convidado, assinatura_remetente, status_pagamento
FROM TransacaoPresente
WHERE id = %s;
"""

LISTAR_POR_CASAL = """
SELECT id, id_presente, id_fonte_compra, id_casal, id_convidado, assinatura_remetente, status_pagamento
FROM TransacaoPresente
WHERE id_casal = %s;
"""

LISTAR_POR_CONVIDADO = """
SELECT id, id_presente, id_fonte_compra, id_casal, id_convidado, assinatura_remetente, status_pagamento
FROM TransacaoPresente
WHERE id_convidado = %s;
"""

LISTAR_TODOS = """
SELECT id, id_presente, id_fonte_compra, id_casal, id_convidado, assinatura_remetente, status_pagamento
FROM TransacaoPresente;
"""
