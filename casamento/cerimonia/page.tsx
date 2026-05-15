'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Cormorant_Garamond, Montserrat } from 'next/font/google';
import igrejaImage from '../../img_igreja.png';
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

export default function Cerimonia() {
  return (
    <main className={`page-shell ${cormorant.variable} ${montserrat.variable}`}>
      <Link href="/" className="classic-link">
        ← Voltar
      </Link>

      <h1 className="page-title page-title--single-line">Cerimônia</h1>

      <figure style={{ margin: '0 auto 2rem', textAlign: 'center', maxWidth: '760px', width: '100%', display: 'block' }}>
        <Image
          src={igrejaImage}
          alt="Local da cerimônia"
          priority
          sizes="(max-width: 900px) 100vw, 760px"
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: '16px',
            boxShadow: '0 18px 45px rgba(78, 60, 53, 0.08)',
            display: 'block',
            margin: '0 auto',
            maxWidth: '100%',
          }}
        />
      </figure>

      <p className="page-subtitle">
        Gostaríamos muito de contar com a presença de todos vocês no momento em que nossa união será abençoada diante de Deus! A cerimônia será rápida e tentaremos ser extremamente pontuais.
      </p>

      <div className="classic-divider" aria-hidden="true" />

      <div style={{ marginBottom: '2.5rem', textAlign: 'center', paddingBottom: '2rem', borderBottom: '1px solid rgba(217, 161, 95, 0.2)' }}>
        <h2 className="section-title">
          Paróquia São João Batista
        </h2>
        <p style={{ fontSize: '1.05rem', color: '#4a4038', margin: 0, fontWeight: 400, lineHeight: 1.6 }}>
          Rua Cel. Luís Carlos 55<br />
          Muqui, ES, 29480-000
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
        <strong>29 de Agosto de 2026</strong> às <strong>15h30</strong>
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
          title="Local da Cerimônia"
          width="100%"
          height="400"
          frameBorder="0"
          src="https://www.google.com/maps?q=Paróquia%20São%20João%20Batista%2C%20Muqui%20-%20ES&output=embed"
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
        <p>📍 Use seu GPS ou mapa para chegar até o endereço. Recomendamos sair com 15 minutos de antecedência.</p>
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
