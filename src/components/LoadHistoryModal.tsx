"use client";

import { useEffect, useState } from "react";
import { getExerciseLoadHistory } from "@/app/actions/workouts";
import { X, TrendingUp, History, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadHistoryModal({ 
  isOpen, 
  onClose, 
  exerciseId, 
  exerciseName, 
  userId 
}: { 
  isOpen: boolean;
  onClose: () => void;
  exerciseId: string;
  exerciseName: string;
  userId?: string;
}) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      getExerciseLoadHistory(userId, exerciseId).then(res => {
        setHistory(res.history || []);
        setLoading(false);
      });
    } else if (isOpen && !userId) {
      setHistory([]);
      setLoading(false);
    }
  }, [isOpen, exerciseId, userId]);

  if (!isOpen) return null;

  const weights = history.map(h => h.weight);
  const maxWeight = weights.length > 0 ? Math.max(...weights) : 1;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl glass rounded-[40px] border border-white/10 overflow-hidden shadow-2xl bg-zinc-900/90"
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="text-primary h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black italic uppercase text-white leading-none">Evolução de Carga</h3>
                  <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-1">{exerciseName}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="h-10 w-10 rounded-full border border-white/5 flex items-center justify-center hover:bg-white/5 transition-colors"
              >
                <X className="h-5 w-5 text-white/40" />
              </button>
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <History className="h-12 w-12 text-white/5 mb-4" />
                <p className="text-white/20 text-sm font-bold uppercase italic">Nenhum registro ainda.<br/>Comece a treinar para ver sua evolução!</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Gráfico Simples */}
                <div className="h-48 flex items-end gap-2 px-4 border-b border-white/5 pb-4">
                  {history.map((h, i) => {
                    const height = (h.weight / maxWeight) * 100;
                    return (
                      <div key={h.id} className="flex-1 flex flex-col items-center group relative">
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-black text-[10px] font-black px-2 py-1 rounded-lg z-10 whitespace-nowrap">
                          {h.weight}kg
                        </div>
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(5, height)}%` }}
                          className={`w-full rounded-t-xl transition-all ${
                            i === history.length - 1 ? 'bg-primary' : 'bg-primary/20 hover:bg-primary/40'
                          }`}
                        />
                        <div className="text-[8px] text-white/20 mt-2 rotate-45 origin-left whitespace-nowrap">
                          {new Date(h.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Lista de Histórico */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                  {history.slice().reverse().map((h) => (
                    <div key={h.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-white/20" />
                        <span className="text-xs text-white/60 font-bold">
                          {new Date(h.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="text-lg font-black italic text-primary">
                        {h.weight}<span className="text-[10px] ml-0.5">kg</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-primary/5 p-6 text-center border-t border-white/5">
            <p className="text-[10px] text-primary/60 uppercase font-black tracking-widest">Keep Pushing. Every kg counts.</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
