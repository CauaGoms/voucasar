import Link from 'next/link';
import { Cormorant_Garamond, Montserrat } from 'next/font/google';
import { getRsvpNames } from '../../../lib/rsvp-db';

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

export const dynamic = 'force-dynamic';

export default function AdminPresencasPage() {
  const nomes = getRsvpNames();

  return (
    <main
      className={`${cormorant.variable} ${montserrat.variable}`}
      style={{
        fontFamily: 'var(--font-montserrat)',
        background: '#fbf7ef',
        minHeight: '100vh',
        padding: '2rem 1rem',
      }}
    >
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            marginBottom: '1.2rem',
            color: '#7f6659',
            textDecoration: 'none',
            fontSize: '1rem',
            fontWeight: 500,
          }}
        >
          ← Voltar
        </Link>

        <h1
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(2.2rem, 6vw, 3rem)',
            margin: '0 0 0.5rem',
            color: '#3f3f42',
            letterSpacing: '0.08em',
            textAlign: 'center',
          }}
        >
          Administração de Presenças
        </h1>

        <p style={{ textAlign: 'center', color: '#7f6659', marginBottom: '1.5rem' }}>
          Total de nomes salvos: <strong>{nomes.length}</strong>
        </p>

        <section
          style={{
            background: '#fff',
            borderRadius: '14px',
            border: '1px solid rgba(217, 161, 95, 0.2)',
            boxShadow: '0 10px 26px rgba(78, 60, 53, 0.06)',
            overflow: 'hidden',
          }}
        >
          {nomes.length === 0 ? (
            <div style={{ padding: '1.2rem', textAlign: 'center', color: '#5d4740' }}>
              Nenhuma presença registrada até o momento.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
                <thead>
                  <tr style={{ background: '#f6f0e5' }}>
                    <th style={{ textAlign: 'left', padding: '0.9rem 1rem', color: '#7f6659' }}>ID</th>
                    <th style={{ textAlign: 'left', padding: '0.9rem 1rem', color: '#7f6659' }}>Nome</th>
                    <th style={{ textAlign: 'left', padding: '0.9rem 1rem', color: '#7f6659' }}>Data de registro</th>
                  </tr>
                </thead>
                <tbody>
                  {nomes.map((item) => (
                    <tr key={item.id} style={{ borderTop: '1px solid rgba(78, 60, 53, 0.08)' }}>
                      <td style={{ padding: '0.85rem 1rem', color: '#4a4038', fontWeight: 600 }}>{item.id}</td>
                      <td style={{ padding: '0.85rem 1rem', color: '#3f3f42' }}>{item.name}</td>
                      <td style={{ padding: '0.85rem 1rem', color: '#5d4740' }}>
                        {new Date(item.created_at).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
