"use client";

import { Play, Zap } from "lucide-react";
import { useState } from "react";
import { createCheckoutSession } from "@/app/actions/stripe";

export function UpgradeBanner() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await createCheckoutSession();
      if (result?.url) {
        window.location.href = result.url;
      } else {
        alert(result?.error || "Erro ao gerar link de pagamento");
      }
    } catch (e: any) {
      alert("Erro ao direcionar para o checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-12 p-8 md:p-10 rounded-[32px] bg-zinc-900 border border-primary/20 shadow-[0_0_40px_rgba(var(--primary-rgb),0.1)] flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left relative overflow-hidden">
      {/* Detalhe de fundo */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="flex flex-col items-center md:items-start z-10">
        <div className="flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest mb-3">
          <Zap className="w-4 h-4" /> Acesso Restrito
        </div>
        <h3 className="text-3xl font-black uppercase italic mb-2">Desbloqueie seu Treino</h3>
        <p className="text-zinc-400 max-w-md">Seus programas estão bloqueados. Assine o Plano VIP por <strong className="text-white">R$ 2,99</strong> e libere musculação, corrida e funcional hoje mesmo.</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto z-10 shrink-0">
        <button 
          onClick={() => alert("Sua aula demonstrativa gratuita estará disponível em breve!")}
          className="bg-zinc-950 text-white font-bold text-sm uppercase px-6 py-4 rounded-2xl border border-zinc-800 hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <Play className="w-4 h-4 text-primary" />
          Aula Grátis
        </button>
        <button 
          onClick={handleCheckout} 
          disabled={loading}
          className="bg-primary text-black text-sm font-black uppercase px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
        >
          {loading ? (
            <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            "Ir para o Checkout VIP"
          )}
        </button>
      </div>
    </div>
  );
}
