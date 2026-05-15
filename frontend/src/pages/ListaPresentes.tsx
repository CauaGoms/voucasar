import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { presenteAPI, Presente, casalAPI, Casal, transacaoPresenteAPI } from '../lib/services';
import { AlertCircle, Loader, ChevronLeft, Heart, ShoppingCart, Search, Copy, CheckCircle2 } from 'lucide-react';

export const ListaPresentes: React.FC = () => {
    const { casalId } = useParams<{ casalId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [presentes, setPresentes] = useState<Presente[]>([]);
    const [casal, setCasal] = useState<Casal | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('todos');

    // Estado para o modal de presente
    const [selectedPresente, setSelectedPresente] = useState<Presente | null>(null);
    const [guestInfo, setGuestInfo] = useState({ nome: '', email: '' });
    const [pixInfo, setPixInfo] = useState<{ chave: string; transacaoId: number; payloadPix?: string; qrCodeBase64?: string } | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        carregarDados();
    }, [casalId]);

    const carregarDados = async () => {
        try {
            setLoading(true);
            const [presentesData, casalData] = await Promise.all([
                presenteAPI.listarPorCasal(parseInt(casalId!)),
                casalAPI.buscarPublico(parseInt(casalId!)),
            ]);
            setPresentes(presentesData);
            setCasal(casalData);
        } catch (err: any) {
            setError('Erro ao carregar presentes');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGiftSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPresente || !casal) return;

        try {
            setSubmitting(true);
            const response = await transacaoPresenteAPI.criarPublico({
                nome_convidado: guestInfo.nome,
                email_convidado: guestInfo.email,
                id_presente: selectedPresente.id,
                id_casal: casal.id,
            });

            setPixInfo({
                chave: response.chave_pix,
                transacaoId: response.id,
                payloadPix: response.payload_pix,
                qrCodeBase64: response.qr_code_base64,
            });
        } catch (err) {
            setError('Erro ao processar presente. Tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const presentesFiltrados = presentes.filter((p) => {
        const matchSearch = p.titulo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus =
            filtroStatus === 'todos' ||
            (filtroStatus === 'comprado' && p.status === 'comprado') ||
            (filtroStatus === 'disponivel' && p.status !== 'comprado');
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
                        onClick={() => navigate(`/casamento/${casalId}`)}
                        className="btn btn-ghost p-2"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-4xl font-serif font-semibold text-gray-900">Lista de Presentes</h1>
                        <p className="text-gray-600 mt-1">Veja os presentes e contribua</p>
                    </div>
                </div>
                {error && (
                    <div className="alert alert-error mb-6">
                        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

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
                        <option value="disponivel">Disponíveis</option>
                        <option value="comprado">Comprados</option>
                    </select>
                </div>

                {/* Lista de Presentes */}
                {presentesFiltrados.length === 0 ? (
                    <div className="card text-center py-12">
                        <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Nenhum presente encontrado</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {presentesFiltrados.map((presente) => (
                            <div
                                key={presente.id}
                                className={`card flex items-center justify-between transition ${
                                    presente.status === 'comprado' ? 'bg-green-50' : ''
                                }`}
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                                        <ShoppingCart className="text-primary-600" size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3
                                            className={`font-semibold ${
                                                presente.status === 'comprado'
                                                    ? 'text-gray-500 line-through'
                                                    : 'text-gray-900'
                                            }`}
                                        >
                                            {presente.titulo}
                                        </h3>
                                        {presente.descricao && (
                                            <p className="text-sm text-gray-600">{presente.descricao}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <p className="text-lg font-semibold text-gray-900 min-w-[100px] text-right">
                                        R$ {presente.valor_estimado?.toFixed(2) || '0,00'}
                                    </p>
                                    {presente.status !== 'comprado' ? (
                                        <button
                                            onClick={() => setSelectedPresente(presente)}
                                            className="btn btn-primary"
                                        >
                                            Presentear
                                        </button>
                                    ) : (
                                        <div className="px-4 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-700">
                                            Comprado
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Botão de Voltar */}
                <div className="mt-12 text-center">
                    <button
                        onClick={() => navigate(`/casamento/${casalId}`)}
                        className="btn btn-secondary"
                    >
                        Voltar para a Página Principal
                    </button>
                </div>
            </div>

            {/* Modal de Presentear */}
            {selectedPresente && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-primary-50 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-white">
                        {!pixInfo ? (
                            <>
                                <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
                                    Presentear com {selectedPresente.titulo}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Para acessar as informações de pagamento, por favor informe seu nome e email.
                                </p>

                                <form onSubmit={handleGiftSubmit} className="space-y-4">
                                    <div>
                                        <label className="label">Seu Nome</label>
                                        <input
                                            type="text"
                                            value={guestInfo.nome}
                                            onChange={(e) => setGuestInfo({ ...guestInfo, nome: e.target.value })}
                                            className="input-field"
                                            required
                                            placeholder="Ex: João Silva"
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Seu Email</label>
                                        <input
                                            type="email"
                                            value={guestInfo.email}
                                            onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                                            className="input-field"
                                            required
                                            placeholder="joao@example.com"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedPresente(null)}
                                            className="btn btn-secondary flex-1"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="btn btn-primary flex-1"
                                        >
                                            {submitting ? 'Processando...' : 'Ver PIX'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="text-center">
                                <CheckCircle2 className="mx-auto text-green-600 mb-4" size={48} />
                                <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-2">
                                    Quase lá!
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Realize o pagamento de <strong>R$ {selectedPresente.valor_estimado.toFixed(2)}</strong> via PIX para confirmar seu presente.
                                </p>

                                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 flex flex-col items-center">
                                    {pixInfo.qrCodeBase64 && (
                                        <div className="mb-4 text-center">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Escaneie o QR Code</p>
                                            <img src={pixInfo.qrCodeBase64} alt="QR Code PIX" className="w-48 h-48 mx-auto rounded-lg border border-gray-100 shadow-sm" />
                                        </div>
                                    )}
                                    <div className="w-full text-center mt-2">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                                            {pixInfo.payloadPix ? "PIX Copia e Cola" : "Chave PIX"}
                                        </p>
                                        <div className="flex items-center gap-2 justify-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                                            <code className="text-sm font-mono text-gray-700 break-all max-h-20 overflow-y-auto w-full text-left">
                                                {pixInfo.payloadPix || pixInfo.chave}
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(pixInfo.payloadPix || pixInfo.chave)}
                                                className="p-2 hover:bg-gray-200 rounded-lg transition flex-shrink-0"
                                                title="Copiar Código"
                                            >
                                                {copied ? <CheckCircle2 className="text-green-600" size={20} /> : <Copy size={20} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setSelectedPresente(null);
                                        setPixInfo(null);
                                        setGuestInfo({ nome: '', email: '' });
                                    }}
                                    className="btn btn-primary w-full"
                                >
                                    Concluído
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
