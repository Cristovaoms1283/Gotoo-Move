"use client";

import { motion } from "framer-motion";
import { User, Phone, CheckCircle2, ArrowRight, Target } from "lucide-react";
import { updateUserProfile } from "@/app/actions/user";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

const GOALS = [
  { id: "hipertrofia", label: "Hipertrofia", description: "Foco em ganho de massa muscular." },
  { id: "emagrecimento", label: "Emagrecimento", description: "Foco em queima de gordura e definição." },
  { id: "condicionamento", label: "Condicionamento", description: "Foco em saúde e resistência física." },
  { id: "reabilitacao", label: "Reabilitação", description: "Foco em recuperação e mobilidade." },
];

export default function OnboardingPage() {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6 pt-32">
      <div className="absolute inset-0 bg-blue-500/5 -z-10 blur-[120px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-zinc-900 border border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden"
      >
        {/* Glow Element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-10" />

        <div className="mb-10">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-4 block">Bem-vindo(a), {user?.firstName}! ✨</span>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-white mb-4">
            COMPLETE SEU <br />
            <span className="text-blue-500">PERFIL</span>
          </h1>
          <p className="text-white/40 font-medium">
            Precisamos de algumas informações rápidas para personalizar seu treinamento e facilitar seu contato direto com a equipe.
          </p>
        </div>

        <form action={async (formData) => {
          setIsSubmitting(true);
          try {
            await updateUserProfile(formData);
          } catch (e) {
            setIsSubmitting(false);
          }
        }} className="space-y-8">
          
          {/* WhatsApp Field */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
              <Phone className="h-3 w-3" />
              Seu WhatsApp (obrigatório)
            </label>
            <div className="relative">
              <input 
                required
                name="whatsapp"
                type="tel" 
                placeholder="(00) 00000-0000"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white text-lg focus:outline-none focus:border-blue-500/50 transition-all font-medium placeholder:text-white/10"
              />
            </div>
          </div>

          {/* Goal Select */}
          <div className="space-y-6">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
              <Target className="h-3 w-3" />
              Qual o seu objetivo principal?
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {GOALS.map((goal) => (
                <label 
                  key={goal.id} 
                  className="relative group cursor-pointer"
                >
                  <input 
                    type="radio" 
                    name="goal" 
                    value={goal.label} 
                    className="sr-only peer"
                    required
                  />
                  <div className="h-full p-5 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all duration-300">
                    <p className="font-black italic uppercase tracking-tight text-white mb-1 group-hover:translate-x-1 transition-transform peer-checked:text-black">
                      {goal.label}
                    </p>
                    <p className="text-xs text-white/30 peer-checked:text-black/60">
                      {goal.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <button 
              disabled={isSubmitting}
              className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.2em] rounded-3xl flex items-center justify-center gap-3 hover:bg-blue-500 hover:text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? "Salvando Perfil..." : "Finalizar e Treinar"}
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

        </form>
      </motion.div>
    </main>
  );
}
