from dataclasses import dataclass
from typing import Optional

@dataclass
class Presente:
    id: int
    id_casal: int
    id_categoria: str
    titulo: str
    descricao: str
    valor_estimado: float
    status: str
    foto_url: Optional[str] = None
    link_produto: Optional[str] = None