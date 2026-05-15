'use client';

import { useEffect } from 'react';

export default function GlobalError({
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
    <html lang="pt-BR">
      <body>
        <main className="error-screen">
          <div className="error-card">
            <p className="error-kicker">Erro do aplicativo</p>
            <h1>Algo não carregou como esperado.</h1>
            <p>
              Você pode tentar recarregar. Se o problema persistir, eu ajusto a estrutura do Next
              para você.
            </p>
            <button type="button" className="section-nav__button" onClick={reset}>
              Recarregar
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}