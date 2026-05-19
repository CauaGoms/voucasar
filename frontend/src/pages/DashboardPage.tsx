import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { casalAPI, Casal, templateAPI } from '../lib/services';
import { Heart, Plus, AlertCircle, Loader, Edit2, Trash2, Users, Eye, Share2, Copy, CheckCircle2, CreditCard, LogOut } from 'lucide-react';

export const DashboardPage: React.FC = () => {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();
    const [casais, setCasais] = useState<Casal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [showPixModal, setShowPixModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [newPixKey, setNewPixKey] = useState('');
    const [formData, setFormData] = useState({
        emailNoivo: '',
        dataCasamento: '',
        chavePix: '',
    });
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [countdown, setCountdown] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
    const [template, setTemplate] = useState<any>(null);

    const handleCopyLink = (id: number) => {
        // Usar slug do template se disponível
        const slug = template?.slug;
        const urlOrPath = slug ? `/casamento/${slug}` : `/casamento/${id}`;
        const url = `${window.location.origin}${urlOrPath}`;

        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    useEffect(() => {
        carregarCasais();
    }, []);

    useEffect(() => {
        if (!casais[0]?.data_casamento) return;

        const updateCountdown = () => {
            const eventDate = new Date(casais[0].data_casamento).getTime();
            const now = new Date().getTime();
            const diff = eventDate - now;

            if (diff <= 0) {
                setCountdown({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
                return;
            }

            setCountdown({
                dias: Math.floor(diff / (1000 * 60 * 60 * 24)),
                horas: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutos: Math.floor((diff / 1000 / 60) % 60),
                segundos: Math.floor((diff / 1000) % 60),
            });
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [casais]);

    const carregarCasais = async () => {
        try {
            setLoading(true);
            const dados = await casalAPI.listar();
            setCasais(dados);
            if (dados && dados.length > 0) {
                try {
                    const temp = await templateAPI.buscar(dados[0].id);
                    setTemplate(temp);
                } catch (err) {
                    console.log('Nenhum template criado ainda:', err);
                }
            }
        } catch (err: any) {
            setError('Erro ao carregar casais');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.emailNoivo) {
            setError('Email do noivo é obrigatório');
            return;
        }
        try {
            const novosCasais = await casalAPI.criar({
                id_usuario_1: usuario?.id || 0,
                id_usuario_2: 0,
                email_usuario_2: formData.emailNoivo,
                data_casamento: formData.dataCasamento,
                chave_pix: formData.chavePix,
            } as Casal);
            
            // Criar template automaticamente com os nomes dos noivos
            if (novosCasais.id && usuario?.nome) {
                try {
                    await templateAPI.atualizar(novosCasais.id, {
                        nomes_noivos: usuario.nome || '',
                        slug: '',  // Backend vai gerar automaticamente
                    } as any);
                } catch (templateErr) {
                    console.log('Aviso: não foi possível criar template automaticamente', templateErr);
                }
            }
            
            setFormData({
                emailNoivo: '',
                dataCasamento: '',
                chavePix: '',
            });
            setShowForm(false);
            setError('');
            await carregarCasais();
        } catch (err) {
            setError('Erro ao criar casal');
        }
    };

    const formatarData = (data: string) => {
        return new Date(data).toLocaleDateString('pt-BR');
    };

    const diasParaCasamento = (data: string) => {
        const hoje = new Date();
        const casamento = new Date(data);
        const diff = casamento.getTime() - hoje.getTime();
        const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return dias > 0 ? dias : 0;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader className="animate-spin text-primary-600" size={32} />
                    <p className="text-gray-600">Carregando dados...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent">
            {/* Header / Topo do Painel */}
            <div className="bg-white/40 backdrop-blur-md border-b border-primary-100 shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            {template && (template.foto_casal_horizontal || template.foto_casal_vertical) ? (
                                <img
                                    src={template.foto_casal_horizontal || template.foto_casal_vertical}
                                    alt="Foto"
                                    className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-full border-2 border-primary-100 flex-shrink-0"
                                />
                            ) : (
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                                    <Heart className="text-[#a89073]" size={20} />
                                </div>
                            )}
                            <div>
                                <h1 className="text-xl md:text-2xl font-serif font-bold text-gray-900 truncate max-w-[200px] md:max-w-none">
                                    {template?.nomes_noivos || usuario?.nome || 'Seu Painel'}
                                </h1>
                                <p className="text-[10px] md:text-xs text-[#a89073] font-bold tracking-[0.1em] uppercase">Painel do Casal</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0">
                            {casais[0] && (
                                <button
                                    onClick={() => handleCopyLink(casais[0].id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${copiedId ? 'bg-green-100 text-green-700' : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                                        }`}
                                >
                                    {copiedId ? <CheckCircle2 size={14} /> : <Share2 size={14} />}
                                    {copiedId ? 'Link Copiado!' : 'Copiar Link'}
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    const slug = template?.slug;
                                    const path = slug ? `/casamento/${slug}` : `/casamento/${casais[0]?.id}`;
                                    navigate(path);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 hover:border-primary-200 text-gray-700 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-sm"
                            >
                                <Eye size={14} /> Ver Site
                            </button>
                            <button
                                onClick={() => setShowLogoutModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-red-100 hover:bg-red-50 text-red-600 rounded-xl text-xs font-bold transition-all shadow-sm"
                            >
                                <LogOut size={14} /> Sair
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                {error && (
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 text-red-700 mb-8 border border-red-100 animate-fade-in">
                        <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* Stats / Countdown - Melhorado para Mobile */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
                    <div className="lg:col-span-8">
                        <div className="bg-[#fffcf8] rounded-[2rem] p-6 md:p-10 border border-primary-100 shadow-xl shadow-primary-500/5 h-full flex flex-col justify-center text-center">
                            <h3 className="text-[10px] font-bold tracking-[0.3em] text-[#a89073] uppercase mb-8">
                                O Grande Dia está Chegando
                            </h3>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                {[
                                    { label: 'Dias', value: countdown.dias },
                                    { label: 'Horas', value: countdown.horas },
                                    { label: 'Minutos', value: countdown.minutos },
                                    { label: 'Segundos', value: countdown.segundos },
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-primary-100 rounded-2xl p-4 md:p-6 border border-primary-200 shadow-sm transition-transform hover:scale-[1.02]">
                                        <span className="text-3xl md:text-5xl font-serif text-[#1e293b] leading-none block mb-2">
                                            {String(item.value).padStart(2, '0')}
                                        </span>

                                        <span className="text-[9px] md:text-[11px] font-bold tracking-[0.1em] text-[#d6aa65] uppercase">
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Ações Rápidas */}
                    <div className="lg:col-span-4 flex flex-col gap-4">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                if (casais[0]) navigate(`/casais/${casais[0].id}/template`);
                            }}
                            className="w-full h-full min-h-[100px] flex items-center justify-between p-6 bg-white rounded-3xl border border-primary-100 active:bg-primary-50 active:scale-[0.98] lg:hover:border-primary-200 lg:hover:shadow-lg transition-all group cursor-pointer"
                        >
                            <div className="flex items-center gap-4 text-left pointer-events-none">
                                <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 transition-transform">
                                    <Edit2 size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Editar Site</h4>
                                    <p className="text-xs text-gray-500">Cores, fotos e história</p>
                                </div>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                if (casais[0]) navigate(`/casais/${casais[0].id}/presentes`);
                            }}
                            className="w-full h-full min-h-[100px] flex items-center justify-between p-6 bg-white rounded-3xl border border-primary-100 active:bg-primary-50 active:scale-[0.98] lg:hover:border-primary-200 lg:hover:shadow-lg transition-all group cursor-pointer"
                        >
                            <div className="flex items-center gap-4 text-left pointer-events-none">
                                <div className="p-3 bg-red-50 rounded-2xl text-red-500 transition-transform">
                                    <Plus size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Lista de Presentes</h4>
                                    <p className="text-xs text-gray-500">Adicionar/remover itens</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Lista de Casais / Detalhes (Ocultar se já tiver um principal ou expandir funcionalidade) */}
                {casais.length === 0 && (
                    <div className="card max-w-2xl mx-auto border-primary-200 p-8 bg-white rounded-[2rem] shadow-sm">
                        <div className="text-center mb-8">
                            <Heart className="mx-auto text-primary-300 mb-4" size={48} />
                            <h3 className="text-2xl font-serif font-semibold text-gray-900">
                                Configure Seu Casamento
                            </h3>
                            <p className="text-gray-600 mt-2">
                                Preencha as informações básicas para começar
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="text-[10px] font-bold tracking-[0.1em] text-[#a89073] uppercase ml-1">Email do Parceiro(a)</label>
                                <input
                                    type="email"
                                    value={formData.emailNoivo}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            emailNoivo: e.target.value,
                                        })
                                    }
                                    className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-2xl focus:border-primary-400 outline-none font-medium"
                                    placeholder="email@exemplo.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold tracking-[0.1em] text-[#a89073] uppercase ml-1">Data do Casamento</label>
                                <input
                                    type="date"
                                    value={formData.dataCasamento}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            dataCasamento: e.target.value,
                                        })
                                    }
                                    className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-2xl focus:border-primary-400 outline-none font-medium"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold tracking-[0.1em] text-[#a89073] uppercase ml-1">Chave PIX para Presentes</label>
                                <input
                                    type="text"
                                    value={formData.chavePix}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            chavePix: e.target.value,
                                        })
                                    }
                                    className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-2xl focus:border-primary-400 outline-none font-medium"
                                    placeholder="Apenas Chave Aleatória"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full h-14 bg-primary-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary-100 hover:bg-primary-700 transition-all mt-4"
                                disabled={loading}
                            >
                                {loading ? 'Salvando...' : 'Criar Meu Casamento'}
                            </button>
                        </form>
                    </div>
                )}

                {casais.map((casal) => (
                    <div key={casal.id} className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up">
                        <div className="card p-8 bg-white shadow-sm border border-primary-100 rounded-[2rem]">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                                    <Users size={24} />
                                </div>
                                <h3 className="text-xl font-serif font-bold text-gray-900">Informações</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center p-4 bg-primary-50/30 rounded-2xl">
                                    <span className="text-sm font-medium text-gray-500">Parceiro(a)</span>
                                    <span className="text-sm font-bold text-gray-900">{casal.email_usuario_2}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-primary-50/30 rounded-2xl">
                                    <span className="text-sm font-medium text-gray-500">Data do Casamento</span>
                                    <span className="text-sm font-bold text-gray-900">{formatarData(casal.data_casamento)}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-[#fdfbf7] border border-primary-100 rounded-2xl relative overflow-hidden group">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-[#a89073] uppercase tracking-wider">Sua Chave PIX</span>
                                        <span className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{casal.chave_pix || 'Não configurada'}</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setNewPixKey(casal.chave_pix || '');
                                            setShowPixModal(true);
                                        }}
                                        className="p-2 hover:bg-white rounded-xl text-primary-600 transition-colors border border-transparent hover:border-primary-100"
                                    >
                                        <CreditCard size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Espaço para Dicas ou Atalhos Secundários */}
                        <div className="card p-8 bg-gradient-to-br from-primary-100/40 to-primary-200/20 text-primary-900 rounded-[2rem] border border-primary-200/50 shadow-sm flex flex-col justify-between">
                            <div>
                                <h3 className="text-2xl font-serif font-bold mb-4 text-primary-900">Dica de Ouro</h3>
                                <p className="text-primary-800/80 text-sm leading-relaxed mb-6">
                                    Adicione pelo menos 5 presentes de diferentes faixas de preço para dar opções aos seus convidados. Presentes via PIX caem direto na sua conta!
                                </p>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Modal Pix (Ajustado) */}
                {showPixModal && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl animate-scale-in">
                            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">Configurar PIX</h3>
                            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                Insira sua chave PIX principal. É para esta chave que os presentes financeiros serão enviados.
                            </p>
                            <input
                                type="text"
                                value={newPixKey}
                                onChange={(e) => setNewPixKey(e.target.value)}
                                className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-2xl focus:border-primary-400 outline-none mb-6 font-medium"
                                placeholder="CPF, E-mail ou Aleatória"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowPixModal(false)}
                                    className="flex-1 h-12 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={async () => {
                                        if (casais[0]) {
                                            try {
                                                await casalAPI.atualizar(casais[0].id, { ...casais[0], chave_pix: newPixKey });
                                                setShowPixModal(false);
                                                carregarCasais();
                                            } catch (e) { setError('Erro ao atualizar PIX'); }
                                        }
                                    }}
                                    className="flex-1 h-12 bg-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-100"
                                >
                                    Salvar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Logout */}
                {showLogoutModal && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl animate-scale-in text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <LogOut className="text-red-500" size={32} />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">Sair do Painel</h3>
                            <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                                Tem certeza que deseja encerrar sua sessão?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="flex-1 h-12 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={async () => {
                                        await logout();
                                        navigate('/login');
                                    }}
                                    className="flex-1 h-12 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-100 hover:bg-red-600 transition-colors"
                                >
                                    Sair
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
