import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, Check } from 'lucide-react';
import { usuarioAPI } from '../lib/services';
import { useAuth } from '../contexts/AuthContext';

export const RegisterPage: React.FC = () => {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmaSenha, setConfirmaSenha] = useState('');
    const [erro, setErro] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [senhaForte, setSenhaForte] = useState(false);

    const navigate = useNavigate();
    const { login, usuario } = useAuth();

    useEffect(() => {
        if (usuario) {
            navigate('/dashboard');
        }
    }, [usuario, navigate]);

    useEffect(() => {
        const temMaiuscula = /[A-Z]/.test(senha);
        const temMinuscula = /[a-z]/.test(senha);
        const temNumero = /[0-9]/.test(senha);
        const temMinimo8 = senha.length >= 8;
        setSenhaForte(temMaiuscula && temMinuscula && temNumero && temMinimo8);
    }, [senha]);

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
            await usuarioAPI.criar(nome, email, senha);
            await login(email, senha);
            navigate('/dashboard');
        } catch (error: any) {
            setErro(error.response?.data?.detail || 'Erro ao criar conta. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-transparent">
            {/* Lado Esquerdo - Info */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center bg-gradient-to-b from-primary-50 to-white p-12">
                <div className="max-w-md">
                    <h2 className="text-5xl font-serif font-semibold text-primary-800 mb-6">Bem-vindo</h2>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-primary-100">
                                <Check className="h-6 w-6 text-primary-800" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Organize sua lista</h3>
                                <p className="text-gray-600 text-sm mt-1">Gerencie todos os presentes em um único lugar</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-primary-100">
                                <Check className="h-6 w-6 text-primary-800" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Compartilhe fácil</h3>
                                <p className="text-gray-600 text-sm mt-1">Convide amigos e familiares para contribuir</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-primary-100">
                                <Check className="h-6 w-6 text-primary-800" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Seguro e confiável</h3>
                                <p className="text-gray-600 text-sm mt-1">Seus dados sempre protegidos e privados</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lado Direito - Formulário */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 bg-transparent">
                <div className="w-full max-w-sm">
                    <div className="text-center mb-10">
                        <h1 className="text-8xl font-brand-logo font-normal text-primary-800 mb-3">VouCasar</h1>
                        <p className="text-gray-600 text-base font-light">Crie sua conta</p>
                    </div>

                    {erro && (
                        <div className="alert alert-error mb-6">
                            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                            <p className="text-red-700 text-sm">{erro}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="nome" className="label">Nome Completo</label>
                            <div className="relative">
                                <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                <input
                                    id="nome"
                                    type="text"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    className="input-field pl-11"
                                    placeholder="João Silva"
                                    required
                                />
                            </div>
                        </div>

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
                            <label htmlFor="senha" className="label flex justify-between">
                                <span>Senha</span>
                                {senha && (
                                    <span className={senhaForte ? 'text-green-600 text-xs' : 'text-orange-600 text-xs'}>
                                        {senhaForte ? '✓ Forte' : 'Fraca'}
                                    </span>
                                )}
                            </label>
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
                            <p className="text-xs text-gray-500 mt-2">
                                Mínimo 8 caracteres, maiúscula, minúscula e número
                            </p>
                        </div>

                        <div>
                            <label htmlFor="confirmaSenha" className="label">Confirmar Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                <input
                                    id="confirmaSenha"
                                    type="password"
                                    value={confirmaSenha}
                                    onChange={(e) => setConfirmaSenha(e.target.value)}
                                    className="input-field pl-11"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !senhaForte}
                            className="btn btn-primary w-full"
                        >
                            {isLoading ? 'Criando conta...' : 'Criar Conta'}
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-gray-200 pt-6">
                        <p className="text-gray-600 text-sm mb-4">Já tem conta?</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="btn btn-ghost w-full"
                        >
                            Faça login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
