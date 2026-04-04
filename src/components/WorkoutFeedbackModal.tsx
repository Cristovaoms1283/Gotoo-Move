"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, TrendingUp, AlertTriangle, CheckCircle2, X } from "lucide-react";

interface WorkoutFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (effort: number) => void;
  isSubmitting?: boolean;
}

const BORG_SCALE = [
  { value: 0, label: "Repouso", color: "bg-blue-500/20 text-blue-400" },
  { value: 1, label: "Muito Leve", color: "bg-blue-400/20 text-blue-300" },
  { value: 2, label: "Leve", color: "bg-cyan-500/20 text-cyan-400" },
  { value: 3, label: "Moderado", color: "bg-green-500/20 text-green-400" },
  { value: 4, label: "Um Pouco Forte", color: "bg-yellow-500/20 text-yellow-400" },
  { value: 5, label: "Forte", color: "bg-orange-500/20 text-orange-400" },
  { value: 6, label: "Forte +", color: "bg-orange-600/20 text-orange-500" },
  { value: 7, label: "Muito Forte", color: "bg-red-500/20 text-red-400" },
  { value: 8, label: "Muito Forte +", color: "bg-red-600/20 text-red-500" },
  { value: 9, label: "Extremamente Forte", color: "bg-purple-600/20 text-purple-400" },
  { value: 10, label: "Exaustivo / Máximo", color: "bg-purple-800/20 text-purple-600" },
];

export default function WorkoutFeedbackModal({ isOpen, onClose, onSubmit, isSubmitting }: WorkoutFeedbackModalProps) {
  const [selectedEffort, setSelectedEffort] = useState<number | null>(null);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-sm" 
        />
        
        <motion.div 
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="relative w-full max-w-lg glass rounded-[40px] p-8 border border-white/10 shadow-2xl bg-zinc-900/90 overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6">
            <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Treino Concluído!</h2>
            <p className="text-white/50 text-sm">Qual foi a sua <span className="text-primary italic font-bold">Percepção de Esforço</span> hoje?</p>
          </div>

          <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 mb-8 pt-2">
            {BORG_SCALE.map((level) => (
              <button
                key={level.value}
                onClick={() => setSelectedEffort(level.value)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 text-left ${
                  selectedEffort === level.value 
                    ? 'border-primary bg-primary/10 scale-[1.02]' 
                    : 'border-white/5 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black italic ${level.color}`}>
                    {level.value}
                  </div>
                  <span className="font-bold uppercase italic text-sm">{level.label}</span>
                </div>
                {selectedEffort === level.value && <CheckCircle2 className="text-primary h-5 w-5" />}
              </button>
            ))}
          </div>

          <button
            disabled={selectedEffort === null || isSubmitting}
            onClick={() => selectedEffort !== null && onSubmit(selectedEffort)}
            className={`w-full py-5 rounded-2xl font-black italic uppercase tracking-widest transition-all ${
              selectedEffort !== null && !isSubmitting
                ? 'bg-primary text-black shadow-[0_0_30px_rgba(var(--primary-rgb),0.4)]'
                : 'bg-white/5 text-white/20 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? "Salvando Evolução..." : "Finalizar e Ganhar FitCoins"}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
