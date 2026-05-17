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
        <div className="min-h-screen flex bg-transparent relative overflow-hidden">
            {/* Imagem de fundo desfocada para celular/tablet */}
            <div 
                className="absolute inset-0 lg:hidden bg-cover bg-center filter blur-[6px] opacity-15 scale-105"
                style={{ backgroundImage: "url('/noivos.jpg')" }}
            ></div>
            <div className="absolute inset-0 lg:hidden bg-gradient-to-b from-amber-50/50 via-transparent to-amber-50/50"></div>

            {/* Lado Esquerdo - Foto */}
            <div
                className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative"
                style={{ backgroundImage: "url('/noivos.jpg')" }}
            >
                <div className="absolute inset-0 bg-black/20"></div>
            </div>

            {/* Lado Direito - Formulário */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative z-10">
                <div className="w-full max-w-sm bg-white/60 md:bg-white/40 backdrop-blur-md p-8 rounded-2xl border border-primary-200/30 shadow-xl lg:shadow-none lg:border-none lg:bg-transparent lg:p-0">
                    <div className="text-center mb-10">
                        <h1 className="text-6xl md:text-8xl font-brand-logo font-normal text-primary-800 mb-3">VouCasar</h1>
                        <p className="text-gray-600 text-base font-light">Organize sua lista de casamento</p>
                    </div>                    {error && (
                        <div className="alert alert-error mb-6">
                            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="label">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-11"
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="senha" className="label">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                <input
                                    id="senha"
                                    type="password"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    className="input-field pl-11"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary w-full"
                        >
                            {isLoading ? 'Autenticando...' : 'Entrar'}
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-gray-200 pt-6">
                        <p className="text-gray-600 text-sm mb-4">Não tem conta?</p>
                        <button
                            onClick={() => navigate('/register')}
                            className="btn btn-ghost w-full"
                        >
                            Cadastre-se agora
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
