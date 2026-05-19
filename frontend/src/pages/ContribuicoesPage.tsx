import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { transacaoPresenteAPI, presenteAPI, TransacaoPresente, Presente } from '../lib/services';
import { Loader, ChevronLeft, Gift, Heart, BaseIcon, CheckCircle2, Clock } from 'lucide-react';

export const ContribuicoesPage: React.FC = () => {
    const { casalId } = useParams<{ casalId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [transacoes, setTransacoes] = useState<TransacaoPresente[]>([]);
    const [presentes, setPresentes] = useState<Presente[]>([]);

    useEffect(() => {
        carregarDados();
    }, [casalId]);

    const carregarDados = async () => {
        try {
            setLoading(true);
            const [transacoesData, presentesData] = await Promise.all([
                transacaoPresenteAPI.listarPorCasal(parseInt(casalId!)),
                presenteAPI.listarPorCasal(parseInt(casalId!))
            ]);
            setTransacoes(transacoesData);
            setPresentes(presentesData);
        } catch (err: any) {
            setError('Erro ao carregar contribuições.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getPresenteDetails = (id_presente?: number) => {
        if (!id_presente) return null;
        return presentes.find(p => p.id === id_presente);
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

    // Calcula resumo
    const totalRecebido = transacoes
        .filter(t => t.status_pagamento === 'pago' || t.id_presente == null)
        .reduce((acc, t) => {
            if (!t.id_presente) {
                // Tenta extrair o valor da assinatura da Cota Livre: "Nome (Cota Livre R$50.0)"
                const match = t.assinatura_remetente.match(/R\$\s*([\d.]+)/);
                if (match) return acc + parseFloat(match[1]);
                return acc;
            } else {
                const p = getPresenteDetails(t.id_presente);
                return acc + (p?.valor_estimado || 0);
            }
        }, 0);

    return (
        <div className="min-h-screen bg-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate('/dashboard')} className="btn btn-ghost p-2 text-gray-500 hover:text-gray-900 border border-gray-200 hover:bg-white rounded-full">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl md:text-5xl font-script-logo font-normal break-words">
                            Contribuições Recebidas
                        </h1>
                        <p className="text-gray-600 font-sans mt-2">Visão geral de quem já contribuiu e deixou um presente!</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="card border-primary-200 shadow-md bg-white p-8">
                        <div className="flex items-center gap-4 mb-4 text-[#a89073]">
                            <Gift size={32} />
                            <h3 className="font-bold text-lg">Total de Presentes/Contribuições doadas</h3>
                        </div>
                        <p className="text-4xl font-serif text-gray-900">{transacoes.length}</p>
                    </div>
                    <div className="card shadow-md p-8 bg-gradient-to-br from-primary-50 to-primary-100 border-none">
                        <div className="flex items-center gap-4 mb-4 text-primary-700">
                            <Heart size={32} />
                            <h3 className="font-bold text-lg">Valor Estimado Recebido (Confirmados)</h3>
                        </div>
                        <p className="text-4xl font-serif text-primary-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRecebido)}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#fcfaf7] text-gray-700 border-b border-[#f4e9d8]">
                                <tr>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Pessoa / Assinatura</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Item / Cota</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status do Pagamento</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transacoes.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                            <Gift className="mx-auto text-gray-300 mb-2" size={32} />
                                            Ninguém enviou presentes ou cotas livres ainda.
                                        </td>
                                    </tr>
                                ) : (
                                    transacoes.map(t => {
                                        const p = getPresenteDetails(t.id_presente);
                                        const cotaLivreMatch = !t.id_presente ? t.assinatura_remetente.match(/R\$\s*([\d.]+)/) : null;
                                        const valorFormatado = p ? p.valor_estimado : (cotaLivreMatch ? parseFloat(cotaLivreMatch[1]) : 0);
                                        
                                        // Extrai o nome se for cota livre (já que o backend salva "Nome (Cota Livre R$X)")
                                        let nomePessoa = t.assinatura_remetente;
                                        if (!t.id_presente && t.assinatura_remetente.includes('(Cota Livre')) {
                                            nomePessoa = t.assinatura_remetente.split(' (Cota Livre')[0];
                                        }

                                        return (
                                            <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900 border-l-4 border-l-transparent">
                                                    {nomePessoa}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {p ? (
                                                        <span className="flex items-center gap-2">
                                                            <Gift size={16} className="text-[#d6aa65]" />
                                                            {p.titulo}
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-2">
                                                            <Heart size={16} className="text-primary-500" />
                                                            Cota Livre PIX
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {t.status_pagamento === 'pago' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                            <CheckCircle2 size={14} /> Pago e Confirmado
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                                            <Clock size={14} /> PIX Gerado (Pendente)
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-gray-900 text-right">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorFormatado)}
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};