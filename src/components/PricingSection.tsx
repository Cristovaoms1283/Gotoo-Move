"use client";

import { Check, Target, Play } from "lucide-react";
import { PLANS } from "@/lib/stripe";
import { motion } from "framer-motion";
import { createCheckoutSession, createOneOffCheckoutSession } from "@/app/actions/stripe";
import { useState } from "react";

const GOALS = [
  "Hipertrofia",
  "Emagrecimento",
  "Recomposição Corporal",
  "Corrida de Rua",
  "Tenho diabetes ou colesterol alto e hipertrofia",
  "Tenho diabetes e colesterol alto e emagrecimento",
  "Sou hipertenso e Hipertrofia",
  "Sou hipertenso e Emagrecimento",
];

export function PricingSection() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState(GOALS[0]);

  const filteredPlans = PLANS.filter(plan => {
    // Se o objetivo selecionado for Corrida, priorizamos os planos de corrida e o avulso
    if (selectedGoal === "Corrida de Rua") {
      return plan.goalGroup === "Corrida" || plan.id === "avulso";
    }
    
    // Para outros objetivos, mostramos todos os planos de musculação/funcional
    // E também incluímos os combos de corrida, pois eles abrangem musculação
    return true;
  });

  const handleSubscribe = async (plan: typeof PLANS[0]) => {
    if (loadingPlan) return;
    
    if (!plan.stripePriceId) {
      alert("Configuração de preço pendente no Stripe.");
      return;
    }

    setLoadingPlan(plan.id);
    console.log(`[PRICING] Iniciando checkout para plano: ${plan.id} | Tipo: ${plan.type}`);
    
    try {
      const isOneOff = plan.type === "one_time";
      let result;

      if (isOneOff) {
        console.log(`[PRICING] Chamando createOneOffCheckoutSession...`);
        result = await createOneOffCheckoutSession(selectedGoal, plan.stripePriceId);
      } else {
        console.log(`[PRICING] Chamando createCheckoutSession...`);
        result = await createCheckoutSession(plan.stripePriceId, selectedGoal);
      }
      
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
      setLoadingPlan(null);
    }
  };

  return (
    <section id="pricing" className="py-24 bg-black/50 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase italic">
            Escolha seu <span className="text-primary">Programa</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
            Selecione seu objetivo principal e nossa IA direcionará o melhor treinamento para você.
          </p>

          {/* Seletor de Objetivo */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {GOALS.map((goal) => (
                <button
                  key={goal}
                  onClick={() => setSelectedGoal(goal)}
                  className={`p-4 rounded-2xl border transition-all text-sm font-bold flex items-center gap-3 ${
                    selectedGoal === goal
                      ? "bg-primary border-primary text-black scale-105 shadow-xl shadow-primary/20"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <Target className={`h-5 w-5 ${selectedGoal === goal ? "text-black" : "text-primary"}`} />
                  {goal}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {filteredPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`glass p-8 rounded-3xl flex flex-col relative ${
                plan.id === "combo-performance" || plan.id === "completo" ? "border-primary/50 ring-2 ring-primary/20 scale-105 z-10" : ""
              }`}
            >
              {(plan.id === "combo-performance" || plan.id === "completo") && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black text-xs font-bold px-4 py-1 rounded-full uppercase">
                  O Melhor
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-white/60 mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">R$ {plan.price}</span>
                  <span className="text-white/60 text-sm">/ {plan.type === 'one_time' ? 'compra única' : 'mês'}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm">
                  <Check className="h-5 w-5 text-primary" />
                  Especializado em <span className="text-primary font-bold">{selectedGoal}</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Check className="h-5 w-5 text-primary" />
                  Vídeos Demonstrativos
                </li>
                {plan.id !== "avulso" && (
                  <li className="flex items-center gap-3 text-sm">
                    <Check className="h-5 w-5 text-primary" />
                    Suporte via WhatsApp
                  </li>
                )}
                {plan.type === "one_time" && (
                  <li className="flex items-center gap-3 text-sm">
                    <Check className="h-5 w-5 text-zinc-500" />
                    Expira em 3 dias
                  </li>
                )}
              </ul>

              <button 
                onClick={() => handleSubscribe(plan)}
                disabled={loadingPlan !== null}
                className={`btn-premium w-full flex items-center justify-center gap-2 ${
                  plan.id === "completo" ? "btn-primary" : "btn-outline"
                } ${loadingPlan === plan.id ? "opacity-75 cursor-wait" : ""}`}
              >
                {loadingPlan === plan.id ? (
                  <>
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Processando...
                  </>
                ) : (
                  `Assinar Plano ${plan.name.split(' ')[0]}`
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Botão de Aula Gratuita */}
        <div className="mt-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block p-1 rounded-2xl bg-gradient-to-r from-primary to-orange-500 shadow-xl shadow-primary/20"
          >
            <button 
              onClick={() => alert("A aula gratuita em breve estará disponível!")}
              className="bg-zinc-950 hover:bg-zinc-900 border border-transparent text-white px-8 py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-colors uppercase w-full sm:w-auto"
            >
              <Play className="h-6 w-6 text-primary" />
              Quero minha aula de funcional em casa gratuita
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
