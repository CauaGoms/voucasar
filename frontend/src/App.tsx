import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { PresentsPage } from './pages/PresentsPage';
import { TemplateEditPage } from './pages/TemplateEditPage';
import { CasamentoPage } from './pages/CasamentoPage';
import { ConfirmarPresencaPage } from './pages/ConfirmarPresencaPage';
import { MaisDetalhesPage } from './pages/MaisDetalhesPage';
import { ListaPresentes } from './pages/ListaPresentes';
import './index.css';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="min-h-screen flex flex-col bg-transparent">
                    <Header />
                    <main className="flex-grow">

                        <Routes>
                            <Route path="/" element={<Navigate to="/login" replace />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <DashboardPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/casais/:casalId/presentes"
                                element={
                                    <ProtectedRoute>
                                        <PresentsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/casais/:casalId/template"
                                element={
                                    <ProtectedRoute>
                                        <TemplateEditPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/casamento/:casalId"
                                element={<CasamentoPage />}
                            />
                            <Route
                                path="/casamento/:casalId/lista-presentes"
                                element={<ListaPresentes />}
                            />
                            <Route
                                path="/casamento/:casalId/confirmar-presenca"
                                element={<ConfirmarPresencaPage />}
                            />
                            <Route
                                path="/casamento/:casalId/detalhes"
                                element={<MaisDetalhesPage />}
                            />
                        </Routes>
                    </main>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
