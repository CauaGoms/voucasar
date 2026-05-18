import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { presenteAPI, Presente, casalAPI, Casal, transacaoPresenteAPI } from '../lib/services';
import { AlertCircle, Loader, ChevronLeft, Heart, ShoppingCart, Search, Copy, CheckCircle2, Gift, Link, ExternalLink } from 'lucide-react';

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
            const templateData = await templateAPI.buscarPublicoPorSlug(casalId!);
            const correctCasalId = templateData.id_casal;
            const [presentesData, casalData] = await Promise.all([
                presenteAPI.listarPorCasal(correctCasalId),
                casalAPI.buscarPublico(correctCasalId),
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8 md:mb-12">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(`/casamento/${casalId}`)}
                            className="btn btn-ghost p-2"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <h1 className="text-3xl md:text-4xl font-serif font-semibold text-gray-900">Lista de Presentes</h1>
                    </div>
                    <p className="text-gray-600 md:mt-1 md:ml-12">Veja os presentes e contribua</p>
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

                {/* Cota Livre Card */}
                {casal && (
                    <div className="card mb-8 border border-primary-200 bg-[#fdfbf7] shadow-md hover:shadow-lg transition">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="p-2 rounded-lg bg-amber-50 text-[#a89073] border border-amber-100 flex items-center justify-center">
                                        <Heart className="animate-pulse text-red-500" size={24} />
                                    </span>
                                    <h2 className="text-xl font-serif font-semibold text-gray-900">
                                        Contribuição de Valor Livre (Cota Especial)
                                    </h2>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Se você preferir presentear os noivos com qualquer outro valor de sua escolha, você pode realizar uma transferência livre diretamente para a chave PIX do casal.
                                </p>
                            </div>
                            <div className="flex items-center gap-3 self-stretch md:self-auto min-w-[200px]">
                                <button
                                    onClick={() => setSelectedPresente({
                                        id: -1,
                                        id_casal: casal.id,
                                        id_categoria: 'Cota Livre',
                                        titulo: 'Contribuição de Valor Livre',
                                        descricao: 'Cota especial com valor livre definido pelo convidado.',
                                        valor_estimado: 0,
                                        status: 'disponivel',
                                    })}
                                    className="btn btn-primary w-full py-3 text-center flex items-center justify-center gap-2"
                                >
                                    <Gift size={18} /> Doar Valor Livre
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
                                className={`card flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${presente.status === 'comprado' ? 'bg-green-50/50' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    {/* Imagem do Presente */}
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
                                                    💸 Presente via PIX
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
                                <div className="flex items-center justify-between sm:justify-end gap-6 self-stretch sm:self-auto">
                                    <p className="text-lg font-serif font-semibold text-gray-900 min-w-[100px] text-right">
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
                                        <div className="px-4 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-700 border border-green-200 shadow-sm">
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
                    <div className="bg-primary-50 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-white max-h-[90vh] overflow-y-auto">

                        {/* FLUXO: COTA LIVRE */}
                        {selectedPresente.id === -1 ? (
                            !pixInfo ? (
                                <>
                                    <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Heart className="text-primary-600" size={24} /> Contribuição Livre
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-6">
                                        Informe o valor com o qual deseja presentear os noivos e seus dados básicos de identificação.
                                    </p>

                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        if (!casal) return;
                                        try {
                                            setSubmitting(true);
                                            setError('');
                                            const response = await transacaoPresenteAPI.criarCotaLivrePublico({
                                                nome_convidado: guestInfo.nome,
                                                email_convidado: guestInfo.email,
                                                valor: selectedPresente.valor_estimado,
                                                id_casal: casal.id,
                                            });
                                            setPixInfo({
                                                chave: response.chave_pix,
                                                transacaoId: 0,
                                                payloadPix: response.payload_pix,
                                                qrCodeBase64: response.qr_code_base64,
                                            });
                                        } catch (err) {
                                            setError('Erro ao gerar cota livre PIX. Tente novamente.');
                                        } finally {
                                            setSubmitting(false);
                                        }
                                    }} className="space-y-4">
                                        <div>
                                            <label className="label">Valor da Contribuição (R$)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="1"
                                                value={selectedPresente.valor_estimado || ''}
                                                onChange={(e) => setSelectedPresente({
                                                    ...selectedPresente,
                                                    valor_estimado: parseFloat(e.target.value) || 0
                                                })}
                                                className="input-field"
                                                required
                                                placeholder="Digite o valor (ex: R$ 150,00)"
                                            />
                                        </div>
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
                                                onClick={() => {
                                                    setSelectedPresente(null);
                                                    setGuestInfo({ nome: '', email: '' });
                                                }}
                                                className="btn btn-secondary flex-1"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="btn btn-primary flex-1"
                                            >
                                                {submitting ? 'Gerando PIX...' : 'Obter PIX'}
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
                                    <p className="text-gray-600 mb-6 text-sm">
                                        Realize o pagamento de <strong>R$ {selectedPresente.valor_estimado.toFixed(2)}</strong> via PIX para confirmar sua contribuição livre:
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

                                    <p className="text-xs text-gray-500 mb-6">
                                        Após realizar a transferência no seu aplicativo de banco, clique no botão abaixo para concluir.
                                    </p>

                                    <button
                                        onClick={() => {
                                            setSelectedPresente(null);
                                            setPixInfo(null);
                                            setGuestInfo({ nome: '', email: '' });
                                        }}
                                        className="btn btn-primary w-full"
                                    >
                                        Concluir Contribuição
                                    </button>
                                </div>
                            )
                        ) : selectedPresente.link_produto ? (
                            !pixInfo ? (
                                <>
                                    <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Gift className="text-primary-600" size={24} /> Presentear
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-6">
                                        Você escolheu <strong>{selectedPresente.titulo}</strong>. Este item é adquirido diretamente em uma loja externa (ex: Amazon, Magalu).
                                    </p>
                                    <p className="text-sm text-gray-600 mb-6">
                                        Por favor, informe seu nome e email para que possamos registrar seu presente no painel dos noivos.
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
                                                {submitting ? 'Carregando...' : 'Ver Link'}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <div className="text-center">
                                    <CheckCircle2 className="mx-auto text-green-600 mb-4" size={48} />
                                    <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-2">
                                        Excelente Escolha!
                                    </h3>
                                    <p className="text-gray-600 mb-6 text-sm">
                                        Agora, clique no botão abaixo para abrir a página do produto e concluir a compra na loja:
                                    </p>

                                    {selectedPresente.foto_url && (
                                        <div className="mb-4">
                                            <img
                                                src={selectedPresente.foto_url}
                                                alt={selectedPresente.titulo}
                                                className="w-24 h-24 object-cover rounded-lg border border-gray-200 mx-auto shadow-sm"
                                                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                            />
                                        </div>
                                    )}

                                    <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 text-center">
                                        <p className="text-sm font-semibold text-gray-700 mb-3">
                                            Valor sugerido: R$ {selectedPresente.valor_estimado.toFixed(2)}
                                        </p>
                                        <a
                                            href={selectedPresente.link_produto}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-primary w-full flex items-center justify-center gap-2 py-3 px-4 font-semibold text-base transition hover:scale-[1.02]"
                                        >
                                            Ir para a Loja <ExternalLink size={18} />
                                        </a>
                                    </div>

                                    <p className="text-xs text-gray-500 mb-6">
                                        Após finalizar a compra do presente na loja externa, clique no botão abaixo para confirmar a reserva do presente aos noivos.
                                    </p>

                                    <button
                                        onClick={() => {
                                            setSelectedPresente(null);
                                            setPixInfo(null);
                                            setGuestInfo({ nome: '', email: '' });
                                            carregarDados(); // Atualiza a lista instantaneamente!
                                        }}
                                        className="btn btn-secondary w-full"
                                    >
                                        Já Realizei a Compra
                                    </button>
                                </div>
                            )
                        ) : (

                            /* FLUXO: PIX PADRÃO */
                            !pixInfo ? (
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
                                            carregarDados(); // Atualiza a lista instantaneamente!
                                        }}
                                        className="btn btn-primary w-full"
                                    >
                                        Concluído
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
