import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { templateAPI, Template, casalAPI, Casal } from '../lib/services';
import { AlertCircle, Loader, ChevronLeft, MapPin, Clock, DollarSign } from 'lucide-react';

export const MaisDetalhesPage: React.FC = () => {
    const { casalId } = useParams<{ casalId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [template, setTemplate] = useState<Template | null>(null);
    const [casal, setCasal] = useState<Casal | null>(null);

    useEffect(() => {
        carregarDados();
    }, [casalId]);

    const carregarDados = async () => {
        try {
            setLoading(true);
            const [templateData, casalData] = await Promise.all([
                templateAPI.buscarPublico(parseInt(casalId!)),
                casalAPI.buscarPublico(parseInt(casalId!)),
            ]);
            setTemplate(templateData);
            setCasal(casalData);
        } catch (err: any) {
            setError('Erro ao carregar detalhes');
            console.error(err);
        } finally {
            setLoading(false);
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

    if (error || !template || !casal) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
                <div className="text-center">
                    <AlertCircle className="mx-auto text-red-600 mb-4" size={48} />
                    <p className="text-red-600 text-lg mb-4">{error || 'Detalhes não encontrados'}</p>
                    <button onClick={() => navigate(`/casamento/${casalId}`)} className="btn btn-primary">
                        Voltar
                    </button>
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
                        onClick={() => navigate(`/casamento/${casalId}`)}
                        className="btn btn-ghost p-2"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-4xl font-serif font-semibold text-gray-900">Mais Detalhes</h1>
                        <p className="text-gray-600 mt-1">Informações sobre o casamento</p>
                    </div>
                </div>
                {/* Data e Horário */}
                <div className="card mb-8">
                    <h2 className="section-title mb-6">Data e Horário</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex items-start gap-4">
                            <Clock className="text-primary-600 flex-shrink-0 mt-1" size={24} />
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Cerimônia</h3>
                                <p className="text-gray-600">
                                    {casal && new Date(casal.data_casamento).toLocaleDateString('pt-BR', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                                <p className="text-gray-600">
                                    {casal && new Date(casal.data_casamento).toLocaleTimeString('pt-BR', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Locais */}
                <div className="card mb-8">
                    <h2 className="section-title mb-6">Locais</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {template.local_cerimonia && (
                            <div className="flex items-start gap-4">
                                <MapPin className="text-primary-600 flex-shrink-0 mt-1" size={24} />
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Cerimônia</h3>
                                    <p className="text-gray-600">{template.local_cerimonia}</p>
                                </div>
                            </div>
                        )}
                        {template.local_recepcao && (
                            <div className="flex items-start gap-4">
                                <MapPin className="text-primary-600 flex-shrink-0 mt-1" size={24} />
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Recepção</h3>
                                    <p className="text-gray-600">{template.local_recepcao}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>


                {/* Botão de Voltar */}
                <div className="mt-8">
                    <button
                        onClick={() => navigate(`/casamento/${casalId}`)}
                        className="btn btn-secondary w-full sm:w-auto"
                    >
                        Voltar para a Página Principal
                    </button>
                </div>
            </div>
        </div>
    );
};
