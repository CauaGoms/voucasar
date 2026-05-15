import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { casalAPI, Casal } from '../lib/services';
import { Heart, Plus, AlertCircle, Loader, Edit2, Trash2, Users, Eye, Share2, Copy, CheckCircle2, CreditCard } from 'lucide-react';

export const DashboardPage: React.FC = () => {
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const [casais, setCasais] = useState<Casal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [showPixModal, setShowPixModal] = useState(false);
    const [newPixKey, setNewPixKey] = useState('');
    const [formData, setFormData] = useState({
        emailNoivo: '',
        dataCasamento: '',
        chavePix: '',
    });
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [countdown, setCountdown] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 });

    const handleCopyLink = (id: number) => {
        const url = `${window.location.origin}/casamento/${id}`;
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
            await casalAPI.criar({
                id_usuario_1: usuario?.id || 0,
                id_usuario_2: 0,
                email_usuario_2: formData.emailNoivo,
                data_casamento: formData.dataCasamento,
                chave_pix: formData.chavePix,
            } as Casal);
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
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h2 className="text-sm font-caps tracking-[0.3em] text-[#a89073] uppercase mb-1">
                            Bem-vindo de volta,
                        </h2>
                        <h1 className="text-4xl font-serif font-semibold text-gray-900">
                            {usuario?.nome || 'Usuário'}
                        </h1>
                    </div>
                </div>
                {error && (
                    <div className="alert alert-error mb-6">
                        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                {/* Stats Cards / Countdown */}
                <div className="grid grid-cols-1 gap-6 mb-12">
                    <div className="card text-center overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-200 via-primary-500 to-primary-200"></div>
                        <h3 className="text-sm font-caps tracking-[0.2em] text-[#a89073] uppercase mb-8 mt-2">
                            Falta Para o Grande Dia
                        </h3>
                        
                        <div className="flex justify-center gap-4 md:gap-8">
                            {[
                                { label: 'Dias', value: countdown.dias },
                                { label: 'Horas', value: countdown.horas },
                                { label: 'Minutos', value: countdown.minutos },
                                { label: 'Segundos', value: countdown.segundos },
                            ].map((item, idx) => (
                                <React.Fragment key={idx}>
                                    <div className="flex flex-col items-center">
                                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-primary-100 shadow-sm min-w-[70px] md:min-w-[90px]">
                                            <span className="text-2xl md:text-4xl font-serif text-[#1e293b] leading-none block mb-1">
                                                {String(item.value).padStart(2, '0')}
                                            </span>
                                            <span className="text-[9px] md:text-xs font-caps tracking-widest text-[#a89073] uppercase">
                                                {item.label}
                                            </span>
                                        </div>
                                    </div>
                                    {idx < 3 && (
                                        <div className="flex items-center text-[#ecdcb9] text-2xl md:text-4xl font-light">
                                            :
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Casal Card ou Formulário Inicial */}
                {casais.length === 0 ? (
                    <div className="card max-w-2xl mx-auto border-primary-200">
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
                                <label className="label">Email do Parceiro(a)</label>
                                <input
                                    type="email"
                                    value={formData.emailNoivo}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            emailNoivo: e.target.value,
                                        })
                                    }
                                    className="input-field"
                                    placeholder="email@exemplo.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="label">Data do Casamento</label>
                                <input
                                    type="date"
                                    value={formData.dataCasamento}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            dataCasamento: e.target.value,
                                        })
                                    }
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div>
                                <label className="label">Chave PIX para Presentes</label>
                                <input
                                    type="text"
                                    value={formData.chavePix}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            chavePix: e.target.value,
                                        })
                                    }
                                    className="input-field"
                                    placeholder="CPF, Email, Telefone ou Chave Aleatória"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-full mt-4 py-4 text-lg"
                                disabled={loading}
                            >
                                {loading ? 'Salvando...' : 'Criar Meu Casamento'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="card hover:shadow-lg transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    Meu Casamento
                                </h3>
                                <p className="text-gray-600">
                                    {formatarData(casais[0].data_casamento)}
                                </p>
                                <p className="text-sm text-primary-600 mt-2">
                                    ⏱ {diasParaCasamento(casais[0].data_casamento)} dias restantes
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => navigate(`/casais/${casais[0].id}/presentes`)}
                                    className="btn btn-primary px-6"
                                >
                                    Ver Presentes
                                </button>
                                <button
                                    onClick={() => {
                                        setNewPixKey(casais[0].chave_pix);
                                        setShowPixModal(true);
                                    }}
                                    className="btn btn-secondary p-3"
                                    title="Alterar Chave PIX"
                                >
                                    <CreditCard size={18} />
                                </button>
                                <button
                                    onClick={() => navigate(`/casais/${casais[0].id}/template`)}
                                    className="btn btn-secondary p-3"
                                    title="Editar Página do Casamento"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleCopyLink(casais[0].id)}
                                    className="btn btn-secondary p-3"
                                    title="Gerar Link para Convidados"
                                >
                                    {copiedId === casais[0].id ? <CheckCircle2 size={18} className="text-green-600" /> : <Share2 size={18} />}
                                </button>
                                <button
                                    onClick={() => window.open(`/casamento/${casais[0].id}`, '_blank')}
                                    className="btn btn-secondary p-3"
                                    title="Visualizar Página Pública"
                                >
                                    <Eye size={18} />
                                </button>

                            </div>
                        </div>
                    </div>
                )}
            </div>

            </div>

            {/* Modal Alterar PIX */}
            {showPixModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#fcf8f1] rounded-2xl shadow-2xl max-w-md w-full p-8 border border-white">
                        <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-6">
                            Alterar Chave PIX
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Esta chave será usada para gerar os QR Codes de presente dos seus convidados.
                        </p>

                        <div className="space-y-5">
                            <div>
                                <label className="label">Nova Chave PIX</label>
                                <input
                                    type="text"
                                    value={newPixKey}
                                    onChange={(e) => setNewPixKey(e.target.value)}
                                    className="input-field"
                                    placeholder="CPF, Email, Telefone ou Chave Aleatória"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowPixModal(false)}
                                    className="btn btn-secondary flex-1"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            setLoading(true);
                                            await casalAPI.atualizar(casais[0].id, {
                                                ...casais[0],
                                                chave_pix: newPixKey
                                            });
                                            await carregarCasais();
                                            setShowPixModal(false);
                                        } catch (err) {
                                            setError('Erro ao atualizar chave PIX');
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    className="btn btn-primary flex-1"
                                >
                                    Salvar Alteração
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
