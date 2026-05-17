import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { presenteAPI, Presente, casalAPI, Casal } from '../lib/services';
import { Plus, Trash2, AlertCircle, Loader, Heart, ChevronLeft, Check, Search, Edit2, Link, Gift, Image } from 'lucide-react';

export const PresentsPage: React.FC = () => {
    const { casalId } = useParams<{ casalId: string }>();
    const navigate = useNavigate();
    const [presentes, setPresentes] = useState<Presente[]>([]);
    const [casal, setCasal] = useState<Casal | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingPresente, setEditingPresente] = useState<Presente | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('todos');

    const [formData, setFormData] = useState({
        titulo: '',
        descricao: '',
        valor_estimado: '',
        id_categoria: '',
        foto_url: '',
        link_produto: '',
    });

    useEffect(() => {
        if (casalId) {
            carregarDados();
        }
    }, [casalId]);

    const carregarDados = async () => {
        try {
            setLoading(true);
            const [casalData, presentesData] = await Promise.all([
                casalAPI.buscar(parseInt(casalId!)),
                presenteAPI.listarPorCasal(parseInt(casalId!)),
            ]);
            setCasal(casalData);
            setPresentes(presentesData);
        } catch (err: any) {
            setError('Erro ao carregar dados');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingPresente) {
                const data = {
                    ...editingPresente,
                    id_categoria: formData.id_categoria,
                    titulo: formData.titulo,
                    descricao: formData.descricao,
                    valor_estimado: parseFloat(formData.valor_estimado),
                    foto_url: formData.foto_url,
                    link_produto: formData.link_produto,
                };
                await presenteAPI.atualizar(editingPresente.id, data);
                setPresentes(
                    presentes.map((p) => (p.id === editingPresente.id ? { ...p, ...data } : p))
                );
            } else {
                const novo = await presenteAPI.criar({
                    id: 0,
                    id_casal: parseInt(casalId!),
                    id_categoria: formData.id_categoria,
                    titulo: formData.titulo,
                    descricao: formData.descricao,
                    valor_estimado: parseFloat(formData.valor_estimado),
                    status: 'disponivel',
                    foto_url: formData.foto_url,
                    link_produto: formData.link_produto,
                } as Presente);
                setPresentes([...presentes, { ...novo, foto_url: formData.foto_url, link_produto: formData.link_produto }]);
            }
            setFormData({
                titulo: '',
                descricao: '',
                valor_estimado: '',
                id_categoria: '',
                foto_url: '',
                link_produto: '',
            });
            setEditingPresente(null);
            setShowForm(false);
        } catch (err: any) {
            setError(editingPresente ? 'Erro ao atualizar presente' : 'Erro ao criar presente');
            console.error(err);
        }
    };

    const handleDelete = async (presenteId: number) => {
        if (window.confirm('Tem certeza que deseja deletar este presente?')) {
            try {
                await presenteAPI.deletar(presenteId);
                setPresentes(presentes.filter((p) => p.id !== presenteId));
            } catch (err: any) {
                setError('Erro ao deletar presente');
                console.error(err);
            }
        }
    };

    const handleToggleComprado = async (id: number, comprado: boolean) => {
        try {
            const presente = presentes.find((p) => p.id === id);
            if (presente) {
                await presenteAPI.atualizar(id, {
                    ...presente,
                    status: comprado ? 'disponivel' : 'comprado',
                } as Presente);
                setPresentes(
                    presentes.map((p) =>
                        p.id === id ? { ...p, status: comprado ? 'disponivel' : 'comprado' } : p
                    )
                );
            }
        } catch (err) {
            setError('Erro ao atualizar presente');
        }
    };

    const presentesFiltrados = presentes.filter((p) => {
        const matchSearch = p.titulo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus =
            filtroStatus === 'todos' ||
            (filtroStatus === 'comprado' && p.status === 'comprado') ||
            (filtroStatus === 'nao-comprado' && p.status !== 'comprado');
        return matchSearch && matchStatus;
    });

    const totalPresentes = presentes.length;
    const totalComprados = presentes.filter((p) => p.status === 'comprado').length;
    const totalPreco = presentes.reduce((acc, p) => acc + (p.valor_estimado || 0), 0);
    const totalCompradoPreco = presentes
        .filter((p) => p.status === 'comprado')
        .reduce((acc, p) => acc + (p.valor_estimado || 0), 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader className="animate-spin text-primary-600" size={32} />
                    <p className="text-gray-600">Carregando presentes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-center gap-4 mb-12">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="btn btn-ghost p-2"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-4xl font-serif font-semibold text-gray-900">Gerenciar Lista de Presentes</h1>
                        <p className="text-gray-600 mt-1">Casal #{casalId}</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingPresente(null);
                            setFormData({
                                titulo: '',
                                descricao: '',
                                valor_estimado: '',
                                id_categoria: '',
                                foto_url: '',
                                link_produto: '',
                            });
                            setShowForm(true);
                        }}
                        className="btn btn-primary flex gap-2 items-center"
                    >
                        <Plus size={20} />
                        Novo Presente
                    </button>
                </div>

                {error && (
                    <div className="alert alert-error mb-6">
                        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="card">
                        <p className="text-sm text-gray-600 mb-1">Total de Presentes</p>
                        <p className="text-3xl font-serif font-semibold text-gray-900">{totalPresentes}</p>
                    </div>
                    <div className="card">
                        <p className="text-sm text-gray-600 mb-1">Comprados</p>
                        <p className="text-3xl font-serif font-semibold text-green-600">{totalComprados}</p>
                    </div>
                    <div className="card">
                        <p className="text-sm text-gray-600 mb-1">Valor Total</p>
                        <p className="text-3xl font-serif font-semibold text-gray-900">
                            R$ {totalPreco.toFixed(2)}
                        </p>
                    </div>
                    <div className="card">
                        <p className="text-sm text-gray-600 mb-1">Valor Comprado</p>
                        <p className="text-3xl font-serif font-semibold text-primary-600">
                            R$ {totalCompradoPreco.toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* Filtros */}
                <div className="mb-8 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar presentes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-11 w-full"
                        />
                    </div>
                    <select
                        value={filtroStatus}
                        onChange={(e) => setFiltroStatus(e.target.value)}
                        className="input-field"
                    >
                        <option value="todos">Todos</option>
                        <option value="nao-comprado">Não Comprados</option>
                        <option value="comprado">Comprados</option>
                    </select>
                </div>

                {/* Lista de Presentes */}
                {presentesFiltrados.length === 0 ? (
                    <div className="card text-center py-12">
                        <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Nenhum presente encontrado</p>
                        <button
                            onClick={() => {
                                setEditingPresente(null);
                                setFormData({
                                    titulo: '',
                                    descricao: '',
                                    valor_estimado: '',
                                    id_categoria: '',
                                    foto_url: '',
                                    link_produto: '',
                                });
                                setShowForm(true);
                            }}
                            className="btn btn-primary"
                        >
                            Adicionar Presente
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {presentesFiltrados.map((presente) => (
                            <div
                                key={presente.id}
                                className={`card flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${presente.status === 'comprado' ? 'bg-green-50/50' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <button
                                        onClick={() =>
                                            handleToggleComprado(presente.id, presente.status === 'comprado')
                                        }
                                        className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition ${presente.status === 'comprado'
                                            ? 'bg-green-600 border-green-600'
                                            : 'border-gray-300 hover:border-green-600'
                                            }`}
                                    >
                                        {presente.status === 'comprado' && (
                                            <Check size={16} className="text-white" />
                                        )}
                                    </button>
                                    
                                    {/* Exibição da Imagem do Presente */}
                                    {presente.foto_url ? (
                                        <img
                                            src={presente.foto_url}
                                            alt={presente.titulo}
                                            className="w-16 h-16 object-cover rounded-lg border border-primary-100 shadow-sm"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=100&auto=format&fit=crop';
                                            }}
                                        />
                                    ) : (
                                        <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100">
                                            <Gift className="text-[#a89073]" size={28} />
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <h3
                                            className={`font-serif font-semibold text-lg truncate ${presente.status === 'comprado'
                                                ? 'text-gray-500 line-through'
                                                : 'text-gray-900'
                                                }`}
                                        >
                                            {presente.titulo}
                                        </h3>
                                        {presente.descricao && (
                                            <p className="text-sm text-gray-500 line-clamp-1">{presente.descricao}</p>
                                        )}
                                        
                                        {/* Badges de Categoria e Opção de Pagamento */}
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {presente.link_produto ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                                    <Link size={12} /> Compra Direta
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                    💸 Receber via PIX
                                                </span>
                                            )}
                                            {presente.id_categoria && (
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                    {presente.id_categoria}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-3 self-end md:self-center">
                                    <p className="text-lg font-serif font-semibold text-gray-900 min-w-[100px] text-right">
                                        R$ {presente.valor_estimado?.toFixed(2) || '0,00'}
                                    </p>
                                    <button
                                        onClick={() => {
                                            setEditingPresente(presente);
                                            setFormData({
                                                titulo: presente.titulo,
                                                descricao: presente.descricao || '',
                                                valor_estimado: presente.valor_estimado.toString(),
                                                id_categoria: presente.id_categoria || '',
                                                foto_url: presente.foto_url || '',
                                                link_produto: presente.link_produto || '',
                                            });
                                            setShowForm(true);
                                        }}
                                        className="btn btn-secondary p-2.5"
                                        title="Editar Presente"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(presente.id)}
                                        className="btn btn-danger p-2.5"
                                        title="Excluir Presente"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Novo/Editar Presente */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-6">
                            {editingPresente ? 'Editar Presente' : 'Novo Presente'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="label">Categoria</label>
                                <input
                                    type="text"
                                    value={formData.id_categoria}
                                    onChange={(e) =>
                                        setFormData({ ...formData, id_categoria: e.target.value })
                                    }
                                    className="input-field"
                                    placeholder="Ex: Eletrônicos"
                                    required
                                />
                            </div>

                            <div>
                                <label className="label">Nome do Presente</label>
                                <input
                                    type="text"
                                    value={formData.titulo}
                                    onChange={(e) =>
                                        setFormData({ ...formData, titulo: e.target.value })
                                    }
                                    className="input-field"
                                    placeholder="Ex: Jogo de Panelas"
                                    required
                                />
                            </div>

                            <div>
                                <label className="label">Descrição (Opcional)</label>
                                <textarea
                                    value={formData.descricao}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            descricao: e.target.value,
                                        })
                                    }
                                    className="input-field"
                                    rows={2}
                                    placeholder="Ex: Cor vermelha, 5 peças"
                                />
                            </div>

                            <div>
                                <label className="label">Preço Estimado</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.valor_estimado}
                                    onChange={(e) =>
                                        setFormData({ ...formData, valor_estimado: e.target.value })
                                    }
                                    className="input-field"
                                    placeholder="0.00"
                                    required
                                />
                            </div>

                            <div>
                                <label className="label">URL da Foto do Presente (Opcional)</label>
                                <input
                                    type="url"
                                    value={formData.foto_url}
                                    onChange={(e) =>
                                        setFormData({ ...formData, foto_url: e.target.value })
                                    }
                                    className="input-field"
                                    placeholder="https://exemplo.com/imagem.jpg"
                                />
                                {formData.foto_url && (
                                    <div className="mt-2 flex items-center gap-3 bg-gray-50 p-2 rounded-lg border">
                                        <img 
                                            src={formData.foto_url} 
                                            alt="Preview" 
                                            className="w-12 h-12 object-cover rounded border" 
                                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} 
                                        />
                                        <span className="text-xs text-gray-500">Visualização da Imagem</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="label">Link de Compra do Produto (Opcional)</label>
                                <input
                                    type="url"
                                    value={formData.link_produto}
                                    onChange={(e) =>
                                        setFormData({ ...formData, link_produto: e.target.value })
                                    }
                                    className="input-field"
                                    placeholder="https://amazon.com.br/produto..."
                                />
                                <p className="text-[11px] text-gray-500 mt-1">
                                    Se preenchido, os convidados comprarão diretamente na loja em vez de fazer um PIX.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="btn btn-secondary flex-1"
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary flex-1">
                                    {editingPresente ? 'Salvar' : 'Adicionar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
