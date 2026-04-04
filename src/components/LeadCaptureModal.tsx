"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Phone, ArrowRight, CheckCircle2 } from "lucide-react";
import { registerLead } from "@/app/actions/leads";
import { toast } from "sonner";

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LeadCaptureModal({ isOpen, onClose }: LeadCaptureModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await registerLead(formData);

    setIsSubmitting(false);

    if (result.success) {
      setIsSuccess(true);
      toast.success("E-mail de confirmação enviado!");
    } else {
      toast.error(result.error || "Ocorreu um erro ao processar seu pedido.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
          >
            {/* Design Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -z-10" />
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-8 md:p-12">
              {!isSuccess ? (
                <>
                  <div className="mb-8">
                    <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase mb-4">
                      AULA EXPERIMENTAL <span className="text-blue-500">GRÁTIS</span>
                    </h2>
                    <p className="text-white/60 font-medium">
                      Descubra como transformar seu corpo com nosso treinamento funcional. Inscreva-se para liberar seu acesso imediato.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Nome Completo</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                        <input 
                          required
                          name="name"
                          type="text" 
                          placeholder="Ex: João Silva"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">E-mail para Acesso</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                        <input 
                          required
                          name="email"
                          type="email" 
                          placeholder="seu@email.com"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">WhatsApp (Celular)</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                        <input 
                          required
                          name="whatsapp"
                          type="tel" 
                          placeholder="(00) 00000-0000"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                        />
                      </div>
                    </div>

                    <p className="text-[10px] text-white/30 text-center leading-relaxed px-4">
                      Ao se inscrever, você receberá um e-mail com o link de confirmação para liberar a aula. Também enviaremos novidades e promoções exclusivas.
                    </p>

                    <button 
                      disabled={isSubmitting}
                      className="w-full mt-4 py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-500 hover:text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Processando..." : "Liberar Minha Aula Agora"}
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </form>
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Quase Pronto!</h3>
                  <p className="text-white/60 mb-8 leading-relaxed">
                    Enviamos um link de confirmação para o seu e-mail. <br />
                    <strong>Acesse seu e-mail agora</strong> e clique no link para liberar sua aula experimental de funcional.
                  </p>
                  <button 
                    onClick={onClose}
                    className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all"
                  >
                    Entendi, fechar
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
