from dataclasses import dataclass

@dataclass
class Template:
    id: int
    id_casal: int
    slug: str
    foto_casal_vertical: str
    foto_casal_horizontal: str
    texto_casal: str
    nomes_noivos: str = ""
    local_cerimonia: str = ""
    local_recepcao: str = ""
    is_public: bool = True