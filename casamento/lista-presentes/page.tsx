"use client";

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Cormorant_Garamond, Montserrat } from 'next/font/google';
import logoImage from '../../logo_la.jpg';
import imgAir from '../../img/img_air.webp';
import imgAr from '../../img/img_ar.webp';
import imgFogao from '../../img/img_fogão.webp';
import imgGeladeira from '../../img/img_geladeira.webp';
import imgMicroondas from '../../img/img_microondas.webp';
import imgPanela from '../../img/img_panela.webp';
import imgTalher from '../../img/img_talher.webp';
import imgTv from '../../img/img_tv.webp';
import imgCafeteira from '../../img/img_cafeteira.webp';
import imgLiquidificador from '../../img/img_liquidificador.webp';
import imgLouca from '../../img/img_louca.webp';
import imgMaquina from '../../img/img_maquina.webp';

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

export default function ListaPresentes() {
  const [showCotas, setShowCotas] = useState(false);

  const products = [
    { id: 'p1', title: 'Air Fryer', price: 'R$ 500,00', image: imgAir, category: 'Eletrodomesticos' },
    { id: 'p2', title: 'Ar condicionado', price: 'R$ 1300,00', image: imgAr, category: 'Eletrodomesticos' },
    { id: 'p3', title: 'Fogao', price: 'R$ 800,00', image: imgFogao, category: 'Eletrodomesticos' },
    { id: 'p4', title: 'Geladeira', price: 'R$ 2500,00', image: imgGeladeira, category: 'Eletrodomesticos' },
    { id: 'p5', title: 'Microondas', price: 'R$ 700,00', image: imgMicroondas, category: 'Eletrodomesticos' },
    { id: 'p6', title: 'Jogo de Panelas', price: 'R$ 400,00', image: imgPanela, category: 'Cozinha' },
    { id: 'p7', title: 'Jogo de Talheres', price: 'R$ 200,00', image: imgTalher, category: 'Cozinha' },
    { id: 'p8', title: 'Televisao', price: 'R$ 2000,00', image: imgTv, category: 'Eletronicos' },
    { id: 'p9', title: 'Cafeteira', price: 'R$ 300,00', image: imgCafeteira, category: 'Eletrodomesticos' },
    { id: 'p10', title: 'Liquidificador', price: 'R$ 300,00', image: imgLiquidificador, category: 'Eletrodomesticos' },
    { id: 'p11', title: 'Maquina de Lavar Louca', price: 'R$ 1200,00', image: imgLouca, category: 'Eletrodomesticos' },
    { id: 'p12', title: 'Maquina de Lavar', price: 'R$ 1500,00', image: imgMaquina, category: 'Eletrodomesticos' },
  ];

  const cotas = [
    { id: 'c1', name: 'Cota Lua de Mel', price: 'R$ 600,00', note: 'Ajuda com os primeiros passos da viagem' },
    { id: 'c2', name: 'Cota Casa Nova', price: 'R$ 250,00', note: 'Contribui com nossa nova casa' },
    { id: 'c3', name: 'Cota Jantar Especial', price: 'R$ 400,00', note: 'Um jantar com carinho para o casal' },
  ];

  const filtered = useMemo(() => products, [products]);

  return (
    <main className={`page-shell ${cormorant.variable} ${montserrat.variable}`}>
      <Link href="/" className="classic-link">
        ← Voltar
      </Link>

      <h1 className="page-title page-title--single-line">
        Lista de Presentes
      </h1>

      <p className="page-subtitle" style={{ marginBottom: '2.5rem' }}>
        Escolha um presente ou uma cota especial. Clique em <strong>Ajudar</strong> para ir ao pagamento.
      </p>

      <div className="classic-divider" aria-hidden="true" />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.9rem',
          marginBottom: '2rem',
        }}
      >
        <a
          href="#produtos"
          className="classic-button"
          style={{
            display: 'inline-block',
            textAlign: 'center',
            padding: '0.9rem 1.2rem',
            background: '#d9a15f',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '999px',
            fontWeight: 600,
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
          Ver produtos
        </a>
        <button
          type="button"
          onClick={() => setShowCotas((current) => !current)}
          className="classic-button classic-button--ghost"
          style={{
            display: 'inline-block',
            textAlign: 'center',
            padding: '0.9rem 1.2rem',
            background: showCotas ? '#7f6659' : '#f6f0e5',
            color: showCotas ? '#fff' : '#7f6659',
            textDecoration: 'none',
            borderRadius: '999px',
            fontWeight: 600,
            border: '1px solid rgba(217, 161, 95, 0.25)',
            transition: 'all 0.16s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            if (!showCotas) {
              e.currentTarget.style.background = '#efe3cf';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!showCotas) {
              e.currentTarget.style.background = '#f6f0e5';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          {showCotas ? 'Ocultar cotas' : 'Falar sobre cotas'}
        </button>
      </div>

      {showCotas && (
        <section
          style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '1.2rem',
            marginBottom: '2rem',
            boxShadow: '0 6px 18px rgba(78, 60, 53, 0.06)',
            border: '1px solid rgba(217, 161, 95, 0.18)',
          }}
        >
          <h2 className="section-title" style={{ fontSize: '1.8rem', marginBottom: '0.4rem', letterSpacing: '0.08em' }}>
            Cotas
          </h2>
          <p style={{ textAlign: 'center', color: '#7f6659', fontSize: '0.92rem', margin: '0 0 1rem' }}>
            Escolha um valor e siga para o pagamento.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.9rem' }}>
            {cotas.map((cota) => (
              <article key={cota.id} style={{ background: '#f6f0e5', borderRadius: '12px', padding: '1rem', textAlign: 'center', border: '1px solid rgba(217, 161, 95, 0.16)' }}>
                <h3 style={{ margin: '0 0 0.35rem', color: '#3f3f42', fontSize: '1.05rem' }}>{cota.name}</h3>
                <div style={{ color: '#7f6659', fontWeight: 700, marginBottom: '0.45rem' }}>{cota.price}</div>
                <p style={{ margin: 0, color: '#5d4740', lineHeight: 1.6, fontSize: '0.95rem' }}>{cota.note}</p>
                <a
                  href={`/lista-presentes/ajudar?title=${encodeURIComponent(cota.name)}&price=${encodeURIComponent(cota.price)}`}
                  className="classic-button"
                  style={{ display: 'inline-block', marginTop: '0.9rem', padding: '0.75rem 1rem', background: '#d9a15f', color: '#fff', textDecoration: 'none', borderRadius: '999px', fontWeight: 700 }}
                >
                  Ajudar
                </a>
              </article>
            ))}
          </div>
        </section>
      )}

      <h2 id="produtos" className="section-title" style={{ fontSize: '1.8rem', marginBottom: '1rem', letterSpacing: '0.08em' }}>Produtos</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {filtered.map((p) => (
          <article key={p.id} style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 28px rgba(78,60,53,0.06)' }}>
            <div style={{ minHeight: '160px', backgroundColor: '#eee' }}>
              <Image src={p.image} alt={p.title} style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ padding: '1rem 1rem 1.25rem' }}>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', color: '#3f3f42' }}>{p.title}</h3>
              <div style={{ color: '#7f6659', marginBottom: '0.8rem', fontWeight: 700 }}>{p.price}</div>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <a href={`/lista-presentes/ajudar?itemId=${encodeURIComponent(p.id)}&title=${encodeURIComponent(p.title)}&price=${encodeURIComponent(p.price)}`} style={{ textDecoration: 'none', flex: 1 }}>
                  <button className="classic-button" style={{ width: '100%', padding: '0.6rem', background: '#d9a15f', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>Ajudar</button>
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div style={{ background: '#f6f0e5', padding: '1.8rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(78, 60, 53, 0.05)' }}>
        <p style={{ color: '#4a4038', lineHeight: 1.7, maxWidth: '620px', margin: '0 auto 1rem' }}>
          Se preferir, você também pode ir direto para a página de pagamento de qualquer item e contribuir com o PIX.
        </p>
        <a href="/lista-presentes/ajudar?title=Cota%20Livre&price=R$%200,00" className="classic-button" style={{ display: 'inline-block', padding: '0.9rem 1.5rem', background: '#d9a15f', color: '#fff', textDecoration: 'none', borderRadius: '999px', fontWeight: 700, transition: 'all 0.16s ease' }}>
          Ir para pagamento
        </a>
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
