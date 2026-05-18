import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, usuario } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (usuario) {
            navigate('/dashboard');
        }
    }, [usuario, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, senha);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Erro ao fazer login. Verifique suas credenciais.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#fcf9f5] font-sans overflow-hidden">
            {/* Background Image / Promo Section ( Estilo Unsplash Premium ) */}
            <div
                className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200')" }}
            >
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute inset-x-0 bottom-0 p-20 bg-gradient-to-t from-black/60 to-transparent text-white">
                    <h2 className="text-4xl font-serif font-bold mb-4">Sua jornada começa aqui</h2>
                    <p className="text-lg font-light opacity-90 leading-relaxed max-w-md">
                        Organize sua lista de presentes e facilite o planejamento do seu grande dia com elegância e simplicidade.
                    </p>
                </div>
            </div>

            {/* Lado Direito - Formulário */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative z-10">
                <div className="w-full max-w-sm">
                    <div className="text-center mb-12">
                        <h1 className="text-6xl md:text-8xl font-brand-logo font-normal text-primary-800 mb-4 animate-fade-in drop-shadow-sm">
                            VouCasar
                        </h1>
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <div className="h-px w-8 bg-primary-200"></div>
                            <p className="text-[#a89073] text-sm font-medium tracking-[0.2em] uppercase">Painel Administrativo</p>
                            <div className="h-px w-8 bg-primary-200"></div>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/50 shadow-[0_20px_50px_rgba(168,144,115,0.1)]">
                        {error && (
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 text-red-700 mb-6 animate-shake border border-red-100">
                                <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
                                <p className="text-xs font-medium leading-relaxed">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-[10px] font-bold tracking-[0.1em] text-[#a89073] uppercase ml-1">E-mail</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary-500" size={18} />
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full h-12 pl-11 pr-4 bg-white rounded-2xl border border-gray-100 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 transition-all outline-none text-gray-700 placeholder:text-gray-300 shadow-sm"
                                        placeholder="exemplo@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="senha" className="text-[10px] font-bold tracking-[0.1em] text-[#a89073] uppercase ml-1">Senha</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary-500" size={18} />
                                    <input
                                        id="senha"
                                        type="password"
                                        value={senha}
                                        onChange={(e) => setSenha(e.target.value)}
                                        className="w-full h-12 pl-11 pr-4 bg-white rounded-2xl border border-gray-100 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 transition-all outline-none text-gray-700 placeholder:text-gray-300 shadow-sm"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white rounded-2xl font-bold tracking-wide shadow-lg shadow-primary-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Entrando...</span>
                                    </>
                                ) : (
                                    'Entrar no Painel'
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-gray-400 text-xs mb-3 font-medium">Não possui cadastro?</p>
                            <button
                                onClick={() => navigate('/register')}
                                className="text-primary-600 hover:text-primary-700 font-bold text-sm underline-offset-4 hover:underline transition-all"
                            >
                                Criar conta agora
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
