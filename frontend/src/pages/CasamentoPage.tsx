import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { templateAPI, Template, casalAPI, Casal } from '../lib/services';
import { AlertCircle, Loader, Heart, Calendar, MapPin } from 'lucide-react';

export const CasamentoPage: React.FC = () => {
    const { casalId } = useParams<{ casalId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [template, setTemplate] = useState<Template | null>(null);
    const [casal, setCasal] = useState<Casal | null>(null);
    const [countdown, setCountdown] = useState({
        dias: 0,
        horas: 0,
        minutos: 0,
        segundos: 0,
    });

    useEffect(() => {
        carregarTemplate();
    }, [casalId]);

    const carregarTemplate = async () => {
        try {
            setLoading(true);
            setError('');

            let templateData;
            try {
                // Tenta carregar pelo slug
                templateData = await templateAPI.buscarPublicoPorSlug(casalId!);
            } catch (slugErr) {
                // Se falhar e for número, tenta carregar pelo ID do casal
                if (!isNaN(Number(casalId))) {
                    templateData = await templateAPI.buscarPublico(Number(casalId));
                } else {
                    throw slugErr;
                }
            }

            const casalData = await casalAPI.buscarPublico(templateData.id_casal);
            setTemplate(templateData);
            setCasal(casalData);
        } catch (err: any) {
            setError('Casamento não encontrado');
            console.error('Erro ao carregar template:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!casal?.data_casamento) return;

        const updateCountdown = () => {
            const eventDate = new Date(casal.data_casamento).getTime();
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
    }, [casal]);

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

    if (error || !template) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
                <div className="text-center">
                    <AlertCircle className="mx-auto text-red-600 mb-4" size={48} />
                    <p className="text-red-600 text-lg mb-4">{error || 'Casamento não encontrado'}</p>
                    <button onClick={() => navigate('/')} className="btn btn-primary">
                        Voltar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">

            {/* Hero Section */}
            <section className="relative h-[80vh] md:h-screen overflow-hidden bg-primary-400 flex items-center justify-center">
                {template.foto_casal_vertical && (
                    <>
                        {/* Imagem de Fundo Desfocada para preencher os espaços */}
                        <img
                            src={template.foto_casal_vertical}
                            className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110"
                            alt=""
                        />
                        {/* Imagem Principal Inteira (sem cortes) */}
                        <img
                            src={template.foto_casal_vertical}
                            alt="Casal"
                            className="absolute inset-0 w-full h-full object-contain object-center p-2 md:p-8"
                        />
                    </>
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/70"></div>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
                    <h1 className="text-5xl sm:text-7xl md:text-9xl font-script-logo font-normal mb-4 break-words max-w-full">
                        {template.nomes_noivos}
                    </h1>
                    <p className="text-lg md:text-2xl font-light uppercase tracking-widest">
                        {casal && new Date(casal.data_casamento).toLocaleDateString('pt-BR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </p>
                </div>
            </section>

            {/* Countdown & Save the Date */}
            {casal?.data_casamento && (
                <section className="py-12 bg-transparent relative z-10 -mt-16 md:-mt-24">
                    <div className="max-w-3xl mx-auto px-4">
                        <div className="bg-[#fdfbf7] rounded-[2rem] shadow-xl p-6 md:p-16 border border-[#f4e9d8] text-center">

                            {/* Contagem Regressiva Title */}
                            <p className="font-caps text-[10px] md:text-sm tracking-[0.3em] text-[#a89073] mb-6 md:mb-8 uppercase">
                                Contagem Regressiva
                            </p>

                            {/* Countdown Boxes */}
                            <div className="flex justify-center gap-2 md:gap-6 mb-8 md:mb-12">
                                {[
                                    { label: 'Dias', value: countdown.dias },
                                    { label: 'Horas', value: countdown.horas },
                                    { label: 'Min', value: countdown.minutos },
                                    { label: 'Seg', value: countdown.segundos },
                                ].map((item) => (
                                    <div key={item.label} className="flex-1 max-w-[80px] md:w-24 aspect-square flex flex-col justify-center items-center border border-[#ecdcb9] rounded-xl md:rounded-2xl bg-[#fdfbf7]">
                                        <span className="text-xl md:text-4xl font-serif text-[#1e293b] leading-none mb-1">
                                            {String(item.value).padStart(2, '0')}
                                        </span>
                                        <span className="text-[8px] md:text-xs font-caps tracking-widest text-[#a89073] uppercase">
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Separator */}
                            <div className="w-32 md:w-48 h-px bg-[#ecdcb9] mx-auto mb-6 md:mb-8"></div>

                            {/* Save the Date */}
                            <p className="font-caps text-[9px] md:text-xs tracking-[0.3em] text-[#a89073] mb-4 uppercase">
                                Save The Date
                            </p>

                            <p className="text-xs md:text-lg font-caps tracking-[0.2em] text-[#d6aa65] mb-6 md:mb-8 uppercase font-medium">
                                {new Date(casal.data_casamento).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </p>

                            <h2 className="text-5xl md:text-8xl font-script-logo text-[#2d3748] mt-4 mb-6 md:mb-8 break-words">
                                {template.nomes_noivos || "Noivos"}
                            </h2>

                            {/* Bottom Line */}
                            <div className="w-32 md:w-48 h-[2px] bg-[#d6aa65] mx-auto"></div>

                        </div>
                    </div>
                </section>
            )}

            {/* Informações */}
            <section className="py-12 bg-white/50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {template.local_cerimonia && (
                            <div className="card">
                                <div className="flex items-start gap-4">
                                    <MapPin className="text-primary-600 flex-shrink-0 mt-1" size={24} />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Cerimônia</h3>
                                        <p className="text-gray-600">{template.local_cerimonia}</p>
                                        {casal?.data_casamento && (
                                            <p className="text-sm text-gray-500 mt-2">
                                                {new Date(casal.data_casamento).toLocaleTimeString('pt-BR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {template.local_recepcao && (
                            <div className="card">
                                <div className="flex items-start gap-4">
                                    <Heart className="text-primary-600 flex-shrink-0 mt-1" size={24} />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Recepção</h3>
                                        <p className="text-gray-600">{template.local_recepcao}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Foto Horizontal */}
            {template.foto_casal_horizontal && (
                <section className="py-12">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <img
                            src={template.foto_casal_horizontal}
                            alt="Noivos"
                            className="w-full rounded-xl shadow-lg"
                        />
                    </div>
                </section>
            )}

            {/* Nossa História */}
            {template.texto_casal && (
                <section className="py-12 bg-white/50">
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-serif font-semibold text-gray-900 text-center mb-8">
                            Nossa História
                        </h2>
                        <div className="prose prose-lg max-w-none">
                            {template.texto_casal.split('\n').map((paragrafo, index) => (
                                <p key={index} className="text-gray-700 text-lg leading-relaxed text-justify mb-4">
                                    {paragrafo}
                                </p>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Seções de Navegação */}
            <section className="py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-serif font-semibold text-gray-900 text-center mb-8">
                        Navegação
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <button
                            onClick={() => window.location.href = `/casamento/${casalId}/lista-presentes`}
                            className="card p-8 text-center hover:shadow-lg transition"
                        >
                            <Heart className="mx-auto text-primary-600 mb-4" size={32} />
                            <h3 className="text-lg font-semibold text-gray-900">Lista de Presentes</h3>
                        </button>
                        <button
                            onClick={() => window.location.href = `/casamento/${casalId}/confirmar-presenca`}
                            className="card p-8 text-center hover:shadow-lg transition"
                        >
                            <Heart className="mx-auto text-primary-600 mb-4" size={32} />
                            <h3 className="text-lg font-semibold text-gray-900">Confirmar Presença</h3>
                        </button>
                        <button
                            onClick={() => window.location.href = `/casamento/${casalId}/detalhes`}
                            className="card p-8 text-center hover:shadow-lg transition"
                        >
                            <Calendar className="mx-auto text-primary-600 mb-4" size={32} />
                            <h3 className="text-lg font-semibold text-gray-900">Mais Detalhes</h3>
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-gray-200 text-center text-gray-600">
                <p>Obrigado por fazer parte do nosso dia!</p>
            </footer>
        </div>
    );
};
