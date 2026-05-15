'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Cormorant_Garamond, Montserrat } from 'next/font/google';
import logoImage from '../../logo_la.jpg';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-montserrat',
});

export default function ConfirmarPresenca() {
  const [nomes, setNomes] = useState(['']);
  const [nomesSalvos, setNomesSalvos] = useState<string[]>([]);
  const [confirmado, setConfirmado] = useState(false);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState('');

  const atualizarNome = (index: number, value: string) => {
    setNomes((prev) => prev.map((item, currentIndex) => (currentIndex === index ? value : item)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nomesValidos = nomes.map((nome) => nome.trim()).filter(Boolean);
    if (nomesValidos.length === 0) return;

    setNomesSalvos(nomesValidos);
    setConfirmado(false);
  };

  const adicionarOutroNome = () => {
    setNomes((prev) => [...prev, '']);
  };

  const confirmarLista = async () => {
    if (nomesSalvos.length === 0) return;

    setSaving(true);
    setErro('');

    try {
      const response = await fetch('/api/presencas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ names: nomesSalvos }),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar nomes');
      }

      setConfirmado(true);
    } catch {
      setErro('Não foi possível salvar agora. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className={`page-shell ${cormorant.variable} ${montserrat.variable}`}>
      <Link href="/" className="classic-link">
        ← Voltar
      </Link>

      <h1 className="page-title page-title--single-line" style={{ marginBottom: '1rem' }}>
        Lista de Presença
      </h1>

      <p className="page-subtitle">
        Digite um nome por vez. Se quiser incluir mais alguém, clique em “Mais”. Depois é só salvar e confirmar a lista.
      </p>

      <div className="classic-divider" aria-hidden="true" />

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        <form
          onSubmit={handleSubmit}
          style={{
            background: '#fff',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(78, 60, 53, 0.06)',
            maxWidth: '620px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          <h2 className="section-title" style={{ fontSize: '1.8rem', marginBottom: '1.25rem' }}>
            Nomes dos convidados
          </h2>

          <div style={{ display: 'grid', gap: '0.9rem', marginBottom: '1.25rem' }}>
            {nomes.map((nome, index) => (
              <input
                key={index}
                type="text"
                value={nome}
                onChange={(event) => atualizarNome(index, event.target.value)}
                placeholder={index === 0 ? 'Digite o nome da pessoa' : 'Digite outro nome'}
                style={{
                  width: '100%',
                  padding: '0.85rem 0.95rem',
                  border: '1px solid #d9a15f',
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                }}
              />
            ))}
          </div>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={adicionarOutroNome}
              className="classic-button classic-button--ghost"
              style={{
                padding: '0.85rem 1.1rem',
                background: '#f6f0e5',
                color: '#7f6659',
                border: '1px solid rgba(217, 161, 95, 0.3)',
                borderRadius: '999px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.16s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#efe3cf';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f6f0e5';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Mais
            </button>

            <button
              type="submit"
              className="classic-button"
              style={{
                padding: '0.85rem 1.1rem',
                background: '#d9a15f',
                color: '#fff',
                border: 'none',
                borderRadius: '999px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.16s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#b87b34';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#d9a15f';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Salvar
            </button>
          </div>
        </form>

        {nomesSalvos.length > 0 && (
          <section
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(251, 247, 239, 0.78)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
              zIndex: 20,
            }}
          >
            <div
              style={{
                background: '#fff',
                padding: '2rem',
                borderRadius: '16px',
                boxShadow: '0 18px 45px rgba(78, 60, 53, 0.12)',
                maxWidth: '560px',
                width: '100%',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: '1.8rem',
                  color: '#d9a15f',
                  margin: '0 0 1rem',
                  textAlign: 'center',
                  letterSpacing: '0.08em',
                }}
              >
                Nomes adicionados
              </h2>

              <div style={{ display: 'grid', gap: '0.85rem', marginBottom: '1.5rem' }}>
                {nomesSalvos.map((nome, index) => (
                  <div
                    key={`${nome}-${index}`}
                    style={{
                      background: '#f6f0e5',
                      padding: '1rem 1.1rem',
                      borderRadius: '10px',
                      border: '1px solid rgba(217, 161, 95, 0.18)',
                      color: '#3f3f42',
                      fontWeight: 600,
                      textAlign: 'center',
                    }}
                  >
                    {nome}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={confirmarLista}
                className="classic-button"
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  background: confirmado ? '#7f6659' : '#d9a15f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '999px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: saving ? 'wait' : 'pointer',
                  transition: 'all 0.16s ease',
                }}
                onMouseEnter={(e) => {
                  if (!confirmado) {
                    e.currentTarget.style.background = '#b87b34';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!confirmado) {
                    e.currentTarget.style.background = '#d9a15f';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
                disabled={confirmado || saving}
              >
                {confirmado ? 'Lista confirmada' : saving ? 'Salvando...' : 'Confirmar'}
              </button>

              {erro && (
                <p style={{ marginTop: '0.7rem', textAlign: 'center', color: '#8d3f3f', lineHeight: 1.6 }}>
                  {erro}
                </p>
              )}

              {confirmado && (
                <p style={{ marginTop: '1rem', textAlign: 'center', color: '#4a4038', lineHeight: 1.7 }}>
                  Obrigado! Sua lista foi confirmada com sucesso.
                </p>
              )}
            </div>
          </section>
        )}
      </div>

      <div className="classic-divider" aria-hidden="true" />

      <div className="signature">
        <Image
          src={logoImage}
          alt="Logo Lais e Antonio"
          className="signature__logo"
        />
      </div>

      <footer className="classic-footer">Obrigado por fazer parte do nosso dia</footer>
    </main>
  );
}
