'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('GLOBAL_ERROR_CAPTURED:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-bold text-red-500 mb-4 italic uppercase">
        Opa! Detectamos um erro no servidor.
      </h2>
      <div className="glass p-6 rounded-2xl border border-white/10 max-w-lg w-full font-mono text-xs text-left overflow-auto">
        <p className="mb-2 text-white/40">Mensagem:</p>
        <p className="text-red-400 mb-4">{error.message || 'Erro desconhecido'}</p>
        <p className="mb-2 text-white/40">Digest:</p>
        <p className="text-primary">{error.digest || 'N/A'}</p>
      </div>
      <button
        onClick={() => reset()}
        className="mt-8 btn-premium btn-primary px-8 py-3 rounded-full"
      >
        Tentar Novamente
      </button>
    </div>
  );
}
