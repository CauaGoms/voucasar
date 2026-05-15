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

export default function Recepcao() {
  return (
    <main className={`page-shell ${cormorant.variable} ${montserrat.variable}`}>
      <Link href="/" className="classic-link">
        ← Voltar
      </Link>

      <h1 className="page-title page-title--single-line">Recepção</h1>

      <p className="page-subtitle">
        Após a cerimônia, gostaríamos de convidá-los para celebrar conosco! Será um momento de muita alegria, onde poderemos compartilhar comidas, bebidas e boas risadas com as pessoas que mais amamos. Esperamos por vocês!
      </p>

      <div className="classic-divider" aria-hidden="true" />

      <div style={{ marginBottom: '2.5rem', textAlign: 'center', paddingBottom: '2rem', borderBottom: '1px solid rgba(217, 161, 95, 0.2)' }}>
        <h2 className="section-title">
          Canto da Roça
        </h2>
        <p style={{ fontSize: '1.05rem', color: '#4a4038', margin: 0, fontWeight: 400, lineHeight: 1.6 }}>
          Sitio Paraiso Santa Marta<br />
          Mimoso do Sul, ES, 29400-000
        </p>
      </div>

      <p
        style={{
          fontSize: '1.2rem',
          fontWeight: 600,
          textAlign: 'center',
          color: '#d9a15f',
          marginBottom: '2rem',
          letterSpacing: '0.08em',
        }}
      >
        <strong>29 de Agosto de 2026</strong>
      </p>

      <div
        className="classic-map-frame"
        style={{
          marginBottom: '2rem',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(78, 60, 53, 0.1)',
        }}
      >
        <iframe
          title="Local da Recepção"
          width="100%"
          height="400"
          frameBorder="0"
          src="https://www.google.com/maps?q=Canto%20da%20Ro%C3%A7a%2C%20Sitio%20Paraiso%20Santa%20Marta%2C%20Mimoso%20do%20Sul%2C%20ES%2C%2029400-000&output=embed"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div
        style={{
          background: '#f6f0e5',
          padding: '1.5rem',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#5d4740',
          fontSize: '0.95rem',
          lineHeight: '1.6',
        }}
      >
        <p>🎉 Será um momento de alegria e celebração. Dirija-se ao local com antecedência. Aguardamos vocês!</p>
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
