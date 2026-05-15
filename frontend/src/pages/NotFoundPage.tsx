import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Heart } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="mb-8">
                    <div className="inline-block">
                        <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary-100 mb-4">
                            <Heart className="h-10 w-10 text-primary-600" />
                        </div>
                    </div>
                </div>

                <h1 className="text-6xl font-serif font-bold text-gray-900 mb-4">404</h1>
                <p className="text-2xl font-semibold text-gray-800 mb-2">Página não encontrada</p>
                <p className="text-gray-600 mb-8">
                    Desculpe, a página que você está procurando não existe. Talvez tenha sido movida ou deletada.
                </p>

                <button
                    onClick={() => navigate('/')}
                    className="btn btn-primary inline-flex items-center gap-2"
                >
                    <Home size={20} />
                    Voltar para a Página Inicial
                </button>
            </div>
        </div>
    );
};
