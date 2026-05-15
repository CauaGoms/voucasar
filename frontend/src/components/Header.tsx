import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export const Header: React.FC = () => {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Don't render header on login/register pages, or any public guest pages
    if (
        location.pathname === '/' || 
        location.pathname === '/login' || 
        location.pathname === '/register' ||
        location.pathname.startsWith('/casamento/')
    ) {
        return null;
    }

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <header className="bg-transparent border-b border-primary-200/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to={usuario ? "/dashboard" : "/login"} className="flex items-center">
                        <span className="text-3xl font-brand-logo text-primary-600">VouCasar</span>
                    </Link>

                    {usuario && (
                        <nav className="hidden md:flex items-center gap-8">
                            <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 transition">
                                Dashboard
                            </Link>
                            <Link to="/presentes" className="text-gray-700 hover:text-primary-600 transition">
                                Presentes
                            </Link>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition"
                                >
                                    <LogOut size={18} />
                                    Sair
                                </button>
                            </div>
                        </nav>
                    )}

                    <button
                        className="md:hidden"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {isMenuOpen && usuario && (
                    <div className="md:hidden pb-4 border-t">
                        <Link to="/dashboard" className="block py-2 text-gray-700 hover:text-primary-600">
                            Dashboard
                        </Link>
                        <Link to="/presentes" className="block py-2 text-gray-700 hover:text-primary-600">
                            Presentes
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full text-left py-2 text-gray-700 hover:text-red-600"
                        >
                            Sair
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};
