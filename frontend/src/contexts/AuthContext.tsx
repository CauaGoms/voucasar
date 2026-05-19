import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario } from '../lib/services';
import { authAPI } from '../lib/services';
import api from '../lib/api';

interface AuthContextType {
    usuario: Usuario | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, senha: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Recuperar token do localStorage na inicialização
        const token = localStorage.getItem('token');
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const user = await authAPI.me();
            setUsuario(user);
        } catch (error) {
            setUsuario(null);
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, senha: string) => {
        const data = await authAPI.login(email, senha);
        setUsuario(data.usuario);
    };

    const logout = async () => {
        await authAPI.logout();
        setUsuario(null);
    };

    return (
        <AuthContext.Provider value={{ usuario, isAuthenticated: !!usuario, isLoading, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
