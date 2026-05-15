"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import logoImage from '../../../logo_la.jpg';

export default function AjudarPage() {
  const search = useSearchParams();
  const title = search.get('title') || 'Presente';
  const price = search.get('price') || '';

  const pix = '28999623156';
  const holder = 'Lais Viguini';
  const bank = 'Sicoob';

  const [copied, setCopied] = useState(false);

  const copyPix = async () => {
    try {
      await navigator.clipboard.writeText(pix);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (e) {
      console.error('copy failed', e);
    }
  };

  return (
    <main className="page-shell page-shell--center">
      <div style={{ width: '100%', maxWidth: '640px', background: '#fff', borderRadius: '14px', padding: '2rem', boxShadow: '0 18px 45px rgba(78,60,53,0.08)', textAlign: 'center' }}>
        <div style={{ textAlign: 'left' }}>
          <Link href="/lista-presentes" className="classic-link" style={{ marginBottom: '1rem' }}>← Voltar</Link>
        </div>

        <h1 className="page-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.2rem)', marginBottom: '0.35rem' }}>{title}</h1>
        {price && <div style={{ color: '#7f6659', fontWeight: 700, marginBottom: '0.9rem' }}>{price}</div>}

        <p style={{ color: '#4a4038', lineHeight: 1.45, marginBottom: '1rem', fontSize: '0.96rem' }}>O PIX está logo abaixo e você pode copiá-lo com um clique.</p>

        <div style={{ background: '#fbf7ef', padding: '1rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid rgba(78,60,53,0.04)' }}>
          <div style={{ fontWeight: 700, color: '#3f3f42', marginBottom: '0.35rem' }}>Titular</div>
          <div style={{ color: '#5d4740', marginBottom: '0.8rem' }}>{holder} — {bank}</div>

          <div style={{ display: 'grid', gap: '0.7rem', justifyItems: 'center' }}>
            <div style={{ width: '100%', fontFamily: 'monospace', fontSize: '1.15rem', letterSpacing: '0.06em', background: '#fff', padding: '0.85rem 0.95rem', borderRadius: '8px', border: '1px solid rgba(78,60,53,0.06)', textAlign: 'center' }}>{pix}</div>
            <button
              onClick={copyPix}
              className="classic-button"
              style={{ padding: '0.75rem 1rem', background: '#d9a15f', color: '#fff', border: 'none', borderRadius: '999px', cursor: 'pointer', fontWeight: 700, minWidth: '160px' }}
            >
              {copied ? 'Copiado' : 'Copiar PIX'}
            </button>
          </div>
        </div>

        
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
