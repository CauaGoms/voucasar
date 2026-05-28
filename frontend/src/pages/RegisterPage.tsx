import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, Check, Circle, X } from 'lucide-react';
import { usuarioAPI } from '../lib/services';
import { getCaptchaToken } from '../lib/captcha';
import { useAuth } from '../contexts/AuthContext';

export const RegisterPage: React.FC = () => {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmaSenha, setConfirmaSenha] = useState('');
    const [erro, setErro] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login, usuario } = useAuth();

    useEffect(() => {
        if (usuario) {
            navigate('/dashboard');
        }
    }, [usuario, navigate]);

    const regrasSenha = useMemo(() => ({
        minimo8: senha.length >= 8,
        maiuscula: /[A-Z]/.test(senha),
        minuscula: /[a-z]/.test(senha),
        numero: /[0-9]/.test(senha),
    }), [senha]);

    const senhaForte = regrasSenha.minimo8 && regrasSenha.maiuscula && regrasSenha.minuscula && regrasSenha.numero;

    const senhasIguais = useMemo(
        () => confirmaSenha.length > 0 && senha === confirmaSenha,
        [senha, confirmaSenha]
    );

    const itensRegrasSenha = [
        { id: 'minimo8', label: 'Mínimo de 8 caracteres', ok: regrasSenha.minimo8 },
        { id: 'maiuscula', label: 'Pelo menos uma letra maiúscula', ok: regrasSenha.maiuscula },
        { id: 'minuscula', label: 'Pelo menos uma letra minúscula', ok: regrasSenha.minuscula },
        { id: 'numero', label: 'Pelo menos um número', ok: regrasSenha.numero },
    ] as const;

    const validarFormulario = () => {
        if (!nome.trim()) {
            setErro('Nome é obrigatório');
            return false;
        }
        if (!email.includes('@')) {
            setErro('Email inválido');
            return false;
        }
        if (senha !== confirmaSenha) {
            setErro('As senhas não correspondem');
            return false;
        }
        if (!senhaForte) {
            setErro('A senha deve ter pelo menos 8 caracteres, com maiúscula, minúscula e número');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro('');

        if (!validarFormulario()) {
            return;
        }

        setIsLoading(true);

        try {
            const captchaToken = getCaptchaToken();
            await usuarioAPI.criar(nome, email, senha, captchaToken);
            await login(email, senha, captchaToken);
            navigate('/dashboard');
        } catch (error: any) {
            setErro(error.response?.data?.detail || 'Erro ao criar conta. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#fcf9f5] font-sans overflow-hidden">
            {/* Lado Esquerdo - Info (Estilo Unsplash) */}
            <div className="hidden lg:flex lg:w-1/2 relative">
                <div className="absolute inset-0 bg-primary-900/40 z-10" />
                <img
                    src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=2069"
                    alt="Wedding"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="relative z-20 flex flex-col justify-end p-16 text-white w-full">
                    <h2 className="text-6xl font-serif font-bold mb-6 max-w-lg leading-tight">Comece sua jornada inesquecível.</h2>
                    <div className="space-y-6 max-w-md">
                        <div className="flex gap-4 items-start bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20">
                            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-2xl bg-white/20">
                                <Check className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Organize sua lista</h3>
                                <p className="text-white/80 text-sm mt-1 leading-relaxed">Gerencie todos os presentes em um único lugar com facilidade.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20">
                            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-2xl bg-white/20">
                                <Check className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Compartilhe fácil</h3>
                                <p className="text-white/80 text-sm mt-1 leading-relaxed">Crie um site lindo e compartilhe com seus convidados em minutos.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lado Direito - Formulário */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-[#fcf9f5] p-6 sm:p-12 relative">
                <div className="absolute top-12 left-12 lg:hidden">
                    <h1 className="text-4xl font-brand-logo text-primary-800">VouCasar</h1>
                </div>

                <div className="w-full max-w-sm animate-fade-in">
                    <div className="text-center mb-10">
                        <div className="hidden lg:block mb-8">
                            <h1 className="text-6xl font-brand-logo text-primary-800 mb-2">VouCasar</h1>
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Criar conta</h2>
                        <p className="text-gray-500 font-medium">Junte-se a milhares de casais felizes</p>
                    </div>

                    {erro && (
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 text-red-700 mb-6 border border-red-100 animate-shake">
                            <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
                            <p className="text-sm font-medium">{erro}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label htmlFor="nome" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                <input
                                    id="nome"
                                    type="text"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    className="w-full bg-white border border-gray-100 focus:border-primary-400 focus:ring-4 focus:ring-primary-400/10 rounded-2xl py-3.5 pl-11 pr-4 text-gray-900 text-sm transition-all outline-none shadow-sm"
                                    placeholder="Pedro Silva"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Seu melhor e-mail</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white border border-gray-100 focus:border-primary-400 focus:ring-4 focus:ring-primary-400/10 rounded-2xl py-3.5 pl-11 pr-4 text-gray-900 text-sm transition-all outline-none shadow-sm"
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="senha" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                                Senha
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                <input
                                    id="senha"
                                    type="password"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    className="w-full bg-white border border-gray-100 focus:border-primary-400 focus:ring-4 focus:ring-primary-400/10 rounded-2xl py-3.5 pl-11 pr-4 text-gray-900 text-sm transition-all outline-none shadow-sm"
                                    placeholder="••••••••"
                                    required
                                    aria-describedby={senha.length > 0 ? 'regras-senha' : undefined}
                                />
                            </div>
                            {senha.length > 0 && (
                                <ul
                                    id="regras-senha"
                                    className="mt-2 space-y-1.5 rounded-xl bg-white/80 border border-gray-100 px-3 py-2.5 shadow-sm"
                                    aria-live="polite"
                                >
                                    {itensRegrasSenha.map((item) => (
                                        <li
                                            key={item.id}
                                            className={`flex items-center gap-2 text-xs font-medium transition-colors duration-200 ${
                                                item.ok ? 'text-green-600' : 'text-gray-400'
                                            }`}
                                        >
                                            {item.ok ? (
                                                <Check className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2.5} />
                                            ) : (
                                                <Circle className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2} />
                                            )}
                                            <span>{item.label}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="confirmaSenha" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Confirmar Senha</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                <input
                                    id="confirmaSenha"
                                    type="password"
                                    value={confirmaSenha}
                                    onChange={(e) => setConfirmaSenha(e.target.value)}
                                    className="w-full bg-white border border-gray-100 focus:border-primary-400 focus:ring-4 focus:ring-primary-400/10 rounded-2xl py-3.5 pl-11 pr-4 text-gray-900 text-sm transition-all outline-none shadow-sm"
                                    placeholder="••••••••"
                                    required
                                    aria-describedby={confirmaSenha.length > 0 ? 'conferencia-senhas' : undefined}
                                />
                            </div>
                            {confirmaSenha.length > 0 && (
                                <p
                                    id="conferencia-senhas"
                                    className={`mt-2 flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium shadow-sm transition-colors duration-200 ${
                                        senhasIguais
                                            ? 'border-green-100 bg-green-50/80 text-green-600'
                                            : 'border-red-100 bg-red-50/80 text-red-600'
                                    }`}
                                    aria-live="polite"
                                >
                                    {senhasIguais ? (
                                        <Check className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2.5} />
                                    ) : (
                                        <X className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2.5} />
                                    )}
                                    {senhasIguais ? 'As senhas coincidem' : 'As senhas não coincidem'}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !senhaForte || !senhasIguais}
                            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-primary-500/30 hover:-translate-y-0.5"
                        >
                            {isLoading ? 'Criando sua conta...' : 'Criar minha conta'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-500 font-medium">
                        Já faz parte?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="text-primary-600 font-bold hover:underline"
                        >
                            Entre aqui
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
