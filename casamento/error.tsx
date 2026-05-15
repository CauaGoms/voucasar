'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="error-screen">
      <div className="error-card">
        <p className="error-kicker">Ops, algo deu errado</p>
        <h1>Estamos ajustando o site.</h1>
        <p>
          O protótipo encontrou um erro temporário. Você pode tentar novamente para recarregar a
          página.
        </p>
        <button type="button" className="section-nav__button" onClick={reset}>
          Tentar novamente
        </button>
      </div>
    </main>
  );
}