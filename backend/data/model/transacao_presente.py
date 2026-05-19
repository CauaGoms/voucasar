from dataclasses import dataclass
from typing import Optional

@dataclass
class TransacaoPresente:
    id: int
    id_presente: Optional[int]
    id_fonte_compra: Optional[int]
    id_casal: int
    id_convidado: int
    assinatura_remetente: str
    status_pagamento: str