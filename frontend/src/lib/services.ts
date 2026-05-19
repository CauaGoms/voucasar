import api from './api';

export interface Usuario {
    id: number;
    nome: string;
    email: string;
}

export interface LoginRequest {
    email: string;
    senha: string;
}

export interface LoginResponse {
    usuario: Usuario;
    token?: string;
}

export interface Casal {
    id: number;
    id_usuario_1: number;
    id_usuario_2: number;
    email_usuario_2: string;
    chave_pix: string;
    data_casamento: string;
}

export interface Presente {
    id: number;
    id_casal: number;
    id_categoria: string;
    titulo: string;
    descricao: string;
    valor_estimado: number;
    status: string;
    foto_url?: string;
    link_produto?: string;
}

export interface FonteCompra {
    id: number;
    id_presente: number;
    tipo: string;
    url_externa: string;
}

export interface TransacaoPresente {
    id: number;
    id_presente: number;
    id_fonte_compra: number;
    id_casal: number;
    id_convidado: number;
    assinatura_remetente: string;
    status_pagamento: string;
}

export interface Template {
    id: number;
    id_casal: number;
    slug?: string;
    foto_casal_vertical: string;
    foto_casal_horizontal: string;
    texto_casal: string;
    nomes_noivos: string;
    local_cerimonia: string;
    local_recepcao: string;
    is_public?: boolean;
}

// Auth APIs
export const authAPI = {
    login: async (email: string, senha: string) => {
        const response = await api.post('/usuario/auth/login', { email, senha });
        const token = response.data.token;
        if (token) {
            localStorage.setItem('token', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        return response.data;
    },
    logout: async () => {
        await api.post('/usuario/auth/logout');
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
    },
    me: async () => {
        const response = await api.get('/usuario/auth/me');
        return response.data;
    },
};

// Usuario APIs
export const usuarioAPI = {
    criar: async (nome: string, email: string, senha: string) => {
        const response = await api.post('/usuario', { nome, email, senha });
        return response.data;
    },
    atualizar: async (id: number, dados: Partial<Usuario>) => {
        const response = await api.put(`/usuario/${id}`, dados);
        return response.data;
    },
    buscar: async (id: number) => {
        const response = await api.get(`/usuario/${id}`);
        return response.data;
    },
};

// Casal APIs
export const casalAPI = {
    criar: async (casal: Omit<Casal, 'id'>) => {
        const response = await api.post('/casal', casal);
        return response.data;
    },
    atualizar: async (id: number, casal: Partial<Casal>) => {
        const response = await api.put(`/casal/${id}`, casal);
        return response.data;
    },
    buscar: async (id: number) => {
        const response = await api.get(`/casal/${id}`);
        return response.data;
    },
    listar: async () => {
        const response = await api.get('/casal');
        return response.data;
    },
    deletar: async (id: number) => {
        await api.delete(`/casal/${id}`);
    },
    buscarPublico: async (id: number) => {
        const response = await api.get(`/casal/publico/${id}`);
        return response.data;
    },
    desvincularparceiro: async (casalId: number) => {
        const response = await api.delete(`/casal/${casalId}/parceiro`);
        return response.data;
    },
    aceitarConvite: async (casalId: number) => {
        const response = await api.post(`/casal/${casalId}/aceitar-convite`);
        return response.data;
    },
    listarConvites: async () => {
        const response = await api.get('/casal/convites/pendentes');
        return response.data;
    },
};

// Presente APIs
export const presenteAPI = {
    criar: async (presente: Omit<Presente, 'id'>) => {
        const response = await api.post('/presente', presente);
        return response.data;
    },
    atualizar: async (id: number, presente: Partial<Presente>) => {
        const response = await api.put(`/presente/${id}`, presente);
        return response.data;
    },
    buscar: async (id: number) => {
        const response = await api.get(`/presente/${id}`);
        return response.data;
    },
    listarPorCasal: async (casalId: number) => {
        const response = await api.get(`/presente/publico/casal/${casalId}`);
        return response.data;
    },
    deletar: async (id: number) => {
        await api.delete(`/presente/${id}`);
    },
};

// FonteCompra APIs
export const fonteCompraAPI = {
    criar: async (fonte: Omit<FonteCompra, 'id'>) => {
        const response = await api.post('/fonte-compra', fonte);
        return response.data;
    },
    atualizar: async (id: number, fonte: Partial<FonteCompra>) => {
        const response = await api.put(`/fonte-compra/${id}`, fonte);
        return response.data;
    },
    buscar: async (id: number) => {
        const response = await api.get(`/fonte-compra/${id}`);
        return response.data;
    },
    listarPorPresente: async (presenteId: number) => {
        const response = await api.get(`/fonte-compra/presente/${presenteId}`);
        return response.data;
    },
    deletar: async (id: number) => {
        await api.delete(`/fonte-compra/${id}`);
    },
};

// TransacaoPresente APIs
export const transacaoPresenteAPI = {
    criar: async (transacao: Omit<TransacaoPresente, 'id'>) => {
        const response = await api.post('/transacao-presente', transacao);
        return response.data;
    },
    atualizar: async (id: number, transacao: Partial<TransacaoPresente>) => {
        const response = await api.put(`/transacao-presente/${id}`, transacao);
        return response.data;
    },
    buscar: async (id: number) => {
        const response = await api.get(`/transacao-presente/${id}`);
        return response.data;
    },
    listarPorCasal: async (casalId: number) => {
        const response = await api.get(`/transacao-presente/casal/${casalId}`);
        return response.data;
    },
    listarPorConvidado: async (convidadoId: number) => {
        const response = await api.get(`/transacao-presente/convidado/${convidadoId}`);
        return response.data;
    },
    deletar: async (id: number) => {
        await api.delete(`/transacao-presente/${id}`);
    },
    criarPublico: async (dados: { nome_convidado: string; email_convidado: string; id_presente: number; id_casal: number }) => {
        const response = await api.post('/transacao-presente/publico', dados);
        return response.data;
    },
    criarCotaLivrePublico: async (dados: { nome_convidado: string; email_convidado: string; valor: number; id_casal: number }) => {
        const response = await api.post('/transacao-presente/publico/cota-livre', dados);
        return response.data;
    },
};

// Template APIs
export const templateAPI = {
    criar: async (casalId: number, template: Omit<Template, 'id'>) => {
        const response = await api.post(`/template/${casalId}`, template);
        return response.data;
    },
    atualizar: async (casalId: number, template: Partial<Template>) => {
        const response = await api.post(`/template/${casalId}`, template);
        return response.data;
    },
    buscar: async (casalId: number) => {
        const response = await api.get(`/template/${casalId}`);
        return response.data;
    },
    buscarPublico: async (casalId: number) => {
        const response = await api.get(`/template/publico/${casalId}`);
        return response.data;
    },
    buscarPublicoPorSlug: async (slug: string) => {
        const response = await api.get(`/template/publico/slug/${slug}`);
        return response.data;
    },
    deletar: async (casalId: number) => {
        await api.delete(`/template/${casalId}`);
    },
};
