"use client";

import { Check, Zap, Play } from "lucide-react";
import { motion } from "framer-motion";
import { createCheckoutSession } from "@/app/actions/stripe";
import { useState } from "react";

export function PricingSection() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (loading) return;
    setLoading(true);
    console.log(`[PRICING] Iniciando checkout para o Plano Único VIP Trial`);
    
    try {
      const result = await createCheckoutSession();
      
      console.log(`[PRICING] Resultado do checkout:`, result);
      
      if (result?.error === "AUTH_REQUIRED") {
        window.location.href = result.url || "/sign-in";
        return;
      }
      
      if (result?.url) {
        window.location.href = result.url;
      } else if (result?.error) {
        alert(`Erro ao iniciar pagamento: ${result.error}${result.message ? ': ' + result.message : ''}`);
      }
    } catch (e: any) {
      console.error("Erro no checkout:", e);
      alert(`Ocorreu um erro ao tentar processar o pagamento: ${e.message || "Erro desconhecido"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="pricing" className="py-24 bg-black/50 overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-4 uppercase italic">
            ACESSO <span className="text-primary">TOTAL</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Esqueça planos engessados. Assine uma única vez e destrave todas as modalidades: Musculação, Corrida e Funcional.
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass p-10 md:p-14 rounded-[40px] flex flex-col relative transition-all duration-300 border-primary/50 ring-2 ring-primary/20 shadow-[0_0_50px_rgba(var(--primary-rgb),0.15)] bg-zinc-900/80 backdrop-blur-xl"
          >
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-black text-sm font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-lg shadow-primary/30 flex items-center gap-2">
              <Zap className="w-4 h-4 fill-black" /> Oferta Especial
            </div>
            
            <div className="text-center mb-8 mt-4">
              <h3 className="text-3xl font-black italic uppercase mb-2">Teste o FitConnect VIP</h3>
              <p className="text-zinc-400 mb-6">Comece sua transformação hoje mesmo.</p>
              
              <div className="flex flex-col items-center justify-center">
                <span className="text-zinc-500 uppercase text-xs font-bold tracking-widest mb-2">1º Mês de Teste</span>
                <div className="flex items-start gap-1 text-primary">
                  <span className="text-2xl font-bold mt-2">R$</span>
                  <span className="text-7xl font-black tracking-tighter leading-none">2,99</span>
                </div>
                <p className="text-sm text-zinc-500 mt-4 max-w-[280px]">
                  Após os 30 dias de teste, o valor é de apenas <strong className="text-white">R$ 19,00/mês</strong>. Cancele a qualquer momento.
                </p>
              </div>
            </div>

            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-8" />

            <ul className="space-y-5 mb-10">
              {[
                "Acesso completo a TODAS as modalidades",
                "Treinos em casa (Funcional sem peso)",
                "Planilhas completas de Corrida",
                "Fichas de Musculação avançadas",
                "Vídeos passo a passo de execução",
                "Suporte Premium"
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-4 text-base font-medium">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button 
              onClick={handleSubscribe}
              disabled={loading}
              className={`w-full py-6 rounded-2xl bg-primary text-black font-black uppercase text-xl tracking-wide transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary/20 flex items-center justify-center gap-3 ${loading ? "opacity-75 cursor-wait" : "hover:bg-primary/90"}`}
            >
              {loading ? (
                <>
                  <div className="h-6 w-6 border-4 border-black/30 border-t-black rounded-full animate-spin" />
                  Processando...
                </>
              ) : (
                "Desbloquear Meu Acesso Agora"
              )}
            </button>
            <div className="text-center mt-4">
              <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">Pagamento 100% Seguro via Stripe</span>
            </div>
          </motion.div>
        </div>

        {/* Botão de Aula Gratuita Alternativo */}
        <div className="mt-24 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block"
          >
            <button 
              onClick={() => alert("A aula gratuita em breve estará disponível!")}
              className="text-zinc-400 hover:text-white px-8 py-5 font-bold text-sm flex items-center justify-center gap-2 transition-colors uppercase mx-auto"
            >
              <Play className="h-5 w-5" />
              Ver uma aula gratuita de demonstração
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
