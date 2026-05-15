import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { casalAPI, Casal } from '../lib/services';
import { AlertCircle, Loader, ChevronLeft, CheckCircle } from 'lucide-react';

export const ConfirmarPresencaPage: React.FC = () => {
    const { casalId } = useParams<{ casalId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [casal, setCasal] = useState<Casal | null>(null);
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        confirmado: false,
        acompanhantes: '0',
    });

    useEffect(() => {
        carregarDados();
    }, [casalId]);

    const carregarDados = async () => {
        try {
            setLoading(true);
            const casalData = await casalAPI.buscarPublico(parseInt(casalId!));
            setCasal(casalData);
        } catch (err: any) {
            setError('Erro ao carregar dados do casamento');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError('');
            setSuccess('');

            // TODO: Implementar endpoint de confirmação de presença
            // Por enquanto, apenas mostra mensagem de sucesso
            setSuccess('Presença confirmada com sucesso! Obrigado por confirmar.');
            setTimeout(() => {
                navigate(`/casamento/${casalId}`);
            }, 3000);
        } catch (err: any) {
            setError('Erro ao confirmar presença');
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader className="animate-spin text-primary-600" size={32} />
                    <p className="text-gray-600">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Main Content */}
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-center gap-4 mb-12">
                    <button
                        onClick={() => navigate(`/casamento/${casalId}`)}
                        className="btn btn-ghost p-2"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-4xl font-serif font-semibold text-gray-900">Confirmar Presença</h1>
                        <p className="text-gray-600 mt-1">Nos ajude a organizar o casamento</p>
                    </div>
                </div>
                {error && (
                    <div className="alert alert-error mb-6">
                        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="alert alert-success mb-6">
                        <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                        <p className="text-green-700 text-sm">{success}</p>
                    </div>
                )}

                <div className="card">
                    <h2 className="section-title mb-6">Seus Dados</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="label">Nome Completo *</label>
                            <input
                                type="text"
                                value={formData.nome}
                                onChange={(e) =>
                                    setFormData({ ...formData, nome: e.target.value })
                                }
                                className="input-field"
                                placeholder="Seu nome"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="label">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    className="input-field"
                                    placeholder="seu@email.com"
                                />
                            </div>

                            <div>
                                <label className="label">Telefone</label>
                                <input
                                    type="tel"
                                    value={formData.telefone}
                                    onChange={(e) =>
                                        setFormData({ ...formData, telefone: e.target.value })
                                    }
                                    className="input-field"
                                    placeholder="(11) 99999-9999"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="label">Número de Acompanhantes</label>
                            <select
                                value={formData.acompanhantes}
                                onChange={(e) =>
                                    setFormData({ ...formData, acompanhantes: e.target.value })
                                }
                                className="input-field"
                            >
                                <option value="0">Apenas eu</option>
                                <option value="1">1 acompanhante</option>
                                <option value="2">2 acompanhantes</option>
                                <option value="3">3+ acompanhantes</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-lg">
                            <input
                                type="checkbox"
                                id="confirmado"
                                checked={formData.confirmado}
                                onChange={(e) =>
                                    setFormData({ ...formData, confirmado: e.target.checked })
                                }
                                className="w-5 h-5 text-primary-600"
                            />
                            <label htmlFor="confirmado" className="text-gray-700 flex-1">
                                Confirmo minha presença no casamento
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={!formData.confirmado}
                            className="btn btn-primary w-full"
                        >
                            Confirmar Presença
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
