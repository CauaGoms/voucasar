import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { templateAPI, Template, casalAPI } from '../lib/services';
import { AlertCircle, Loader, ChevronLeft, ImagePlus } from 'lucide-react';

export const TemplateEditPage: React.FC = () => {
    const { casalId } = useParams<{ casalId: string }>();
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [casal, setCasal] = useState<any>(null);

    const [formData, setFormData] = useState({
        nomes_noivos: '',
        texto_casal: '',
        local_cerimonia: '',
        local_recepcao: '',
        foto_casal_vertical: '',
        foto_casal_horizontal: '',
        data_casamento: '',
        is_public: true,
    });

    useEffect(() => {
        carregarDados();
    }, [casalId]);

    const carregarDados = async () => {
        try {
            setLoading(true);
            const [casalData, templateData] = await Promise.all([
                casalAPI.buscar(parseInt(casalId!)),
                templateAPI.buscar(parseInt(casalId!)).catch(() => null),
            ]);

            setCasal(casalData);

            if (templateData) {
                setFormData({
                    nomes_noivos: templateData.nomes_noivos || '',
                    texto_casal: templateData.texto_casal || '',
                    local_cerimonia: templateData.local_cerimonia || '',
                    local_recepcao: templateData.local_recepcao || '',
                    foto_casal_vertical: templateData.foto_casal_vertical || '',
                    foto_casal_horizontal: templateData.foto_casal_horizontal || '',
                    data_casamento: casalData.data_casamento || '',
                    is_public: templateData.is_public ?? true,
                });
            }
        } catch (err: any) {
            setError('Erro ao carregar dados');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'foto_casal_vertical' | 'foto_casal_horizontal') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target?.result as string;
                setFormData({ ...formData, [field]: base64 });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError('');
            setSuccess('');

            await Promise.all([
                templateAPI.atualizar(parseInt(casalId!), {
                    id: 0,
                    id_casal: parseInt(casalId!),
                    nomes_noivos: formData.nomes_noivos,
                    texto_casal: formData.texto_casal,
                    local_cerimonia: formData.local_cerimonia,
                    local_recepcao: formData.local_recepcao,
                    foto_casal_vertical: formData.foto_casal_vertical,
                    foto_casal_horizontal: formData.foto_casal_horizontal,
                    is_public: formData.is_public,
                } as Partial<Template>),
                casalAPI.atualizar(parseInt(casalId!), {
                    data_casamento: formData.data_casamento
                })
            ]);

            setSuccess('Template salvo com sucesso!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError('Erro ao salvar template');
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
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-center gap-4 mb-12">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="btn btn-ghost p-2"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-4xl font-serif font-semibold text-gray-900">Editar Página do Casamento</h1>
                        <p className="text-gray-600 mt-1">Customize como seus convidados verão sua história</p>
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
                        <p className="text-green-700 text-sm">✓ {success}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Informações Básicas */}
                    <div className="card">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="section-title mb-0">Informações Básicas</h2>
                            <label className="flex items-center cursor-pointer">
                                <span className="mr-3 text-sm font-medium text-gray-700">Disponibilizar ao público</span>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={formData.is_public}
                                        onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                                    />
                                    <div className={`block w-14 h-8 rounded-full ${formData.is_public ? 'bg-primary-500' : 'bg-gray-300'}`}></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${formData.is_public ? 'transform translate-x-6' : ''}`}></div>
                                </div>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="label">Nomes dos Noivos</label>
                                <input
                                    type="text"
                                    value={formData.nomes_noivos}
                                    onChange={(e) =>
                                        setFormData({ ...formData, nomes_noivos: e.target.value })
                                    }
                                    className="input-field"
                                    placeholder="Ex: João & Maria"
                                />
                            </div>
                            <div>
                                <label className="label">Data do Casamento</label>
                                <input
                                    type="date"
                                    value={formData.data_casamento}
                                    onChange={(e) =>
                                        setFormData({ ...formData, data_casamento: e.target.value })
                                    }
                                    className="input-field"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="label">Local da Cerimônia</label>
                                <input
                                    type="text"
                                    value={formData.local_cerimonia}
                                    onChange={(e) =>
                                        setFormData({ ...formData, local_cerimonia: e.target.value })
                                    }
                                    className="input-field"
                                    placeholder="Ex: Igreja de São Francisco"
                                />
                            </div>
                            <div>
                                <label className="label">Local da Recepção</label>
                                <input
                                    type="text"
                                    value={formData.local_recepcao}
                                    onChange={(e) =>
                                        setFormData({ ...formData, local_recepcao: e.target.value })
                                    }
                                    className="input-field"
                                    placeholder="Ex: Salão de Festas"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Fotos */}
                    <div className="card">
                        <h2 className="section-title mb-6">Fotos</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="label">Foto Vertical (Para o Hero)</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'foto_casal_vertical')}
                                        className="hidden"
                                        id="foto-vertical"
                                    />
                                    <label htmlFor="foto-vertical" className="cursor-pointer">
                                        <ImagePlus className="mx-auto text-gray-400 mb-2" size={32} />
                                        <p className="text-sm text-gray-600">Clique para selecionar</p>
                                        <p className="text-xs text-gray-400 mt-1">Recomendado: 9:16</p>
                                    </label>
                                </div>
                                {formData.foto_casal_vertical && (
                                    <img src={formData.foto_casal_vertical} alt="Preview vertical" className="mt-4 rounded-lg max-h-48 mx-auto" />
                                )}
                            </div>

                            <div>
                                <label className="label">Foto Horizontal (Para os Noivos)</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'foto_casal_horizontal')}
                                        className="hidden"
                                        id="foto-horizontal"
                                    />
                                    <label htmlFor="foto-horizontal" className="cursor-pointer">
                                        <ImagePlus className="mx-auto text-gray-400 mb-2" size={32} />
                                        <p className="text-sm text-gray-600">Clique para selecionar</p>
                                        <p className="text-xs text-gray-400 mt-1">Recomendado: 16:9</p>
                                    </label>
                                </div>
                                {formData.foto_casal_horizontal && (
                                    <img src={formData.foto_casal_horizontal} alt="Preview horizontal" className="mt-4 rounded-lg max-h-48 mx-auto" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Texto */}
                    <div className="card">
                        <h2 className="section-title mb-6">Nossa História</h2>
                        <div>
                            <label className="label">Texto sobre o Casal</label>
                            <textarea
                                value={formData.texto_casal}
                                onChange={(e) =>
                                    setFormData({ ...formData, texto_casal: e.target.value })
                                }
                                className="input-field resize-none"
                                rows={10}
                                placeholder="Conte a sua história, como vocês se conheceram, o que os une..."
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                {formData.texto_casal.length} caracteres
                            </p>
                        </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="btn btn-secondary flex-1"
                        >
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary flex-1">
                            Salvar Template
                        </button>
                        <button
                            type="button"
                            onClick={() => window.open(`/casamento/${casalId}`, '_blank')}
                            className="btn btn-ghost flex-1"
                        >
                            Visualizar Página
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
