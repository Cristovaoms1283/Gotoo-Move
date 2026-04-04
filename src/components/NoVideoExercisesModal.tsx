"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Save, Loader2, AlertCircle, CheckCircle2, Video } from "lucide-react";
import { getExercisesWithoutVideo, updateVideoForExerciseName } from "@/app/actions/workouts";
import { UploadButton } from "@/utils/uploadthing";

export default function NoVideoExercisesModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [exercises, setExercises] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingName, setUpdatingName] = useState<string | null>(null);
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({});

  const loadExercises = async () => {
    setIsLoading(true);
    try {
      const data = await getExercisesWithoutVideo();
      setExercises(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadExercises();
    }
  }, [isOpen]);

  const handleSave = async (name: string) => {
    const url = videoUrls[name];
    if (!url) return;

    setUpdatingName(name);
    try {
      const result = await updateVideoForExerciseName(name, url, "upload");
      if (result.success) {
        setExercises(prev => prev.filter(ex => ex !== name));
        const newUrls = { ...videoUrls };
        delete newUrls[name];
        setVideoUrls(newUrls);
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar o vídeo.");
    } finally {
      setUpdatingName(null);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 px-4 py-2 rounded-lg font-medium transition shadow-sm"
      >
        <Video className="w-4 h-4 text-orange-500" />
        Exercícios SN
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    Exercícios sem Vídeo
                  </h2>
                  <p className="text-sm text-zinc-500 mt-1">
                    Lista de exercícios únicos que não possuem nenhuma demonstração em vídeo.
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-zinc-800 rounded-full transition text-zinc-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    <p className="text-zinc-500 animate-pulse font-medium">Buscando exercícios no sistema...</p>
                  </div>
                ) : exercises.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-zinc-100 font-bold text-lg">Tudo sincronizado!</h3>
                      <p className="text-zinc-500 text-sm max-w-[280px]">
                        Não encontramos nenhum exercício sem vídeo no momento.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {exercises.map((name) => (
                      <div
                        key={name}
                        className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 space-y-4 hover:border-zinc-700/50 transition group"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-0.5">
                            <span className="font-bold text-zinc-100 text-lg group-hover:text-orange-400 transition-colors uppercase tracking-tight italic">{name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black bg-red-500 text-white px-2 py-0.5 rounded-sm uppercase tracking-tighter italic">Pendente</span>
                              <span className="text-xs text-zinc-600">Aguardando vídeo de demonstração</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            {videoUrls[name] ? (
                              <div className="bg-zinc-900 border border-green-500/30 rounded-lg py-2.5 px-4 flex items-center justify-between shadow-inner">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                                  <span className="text-[11px] text-green-500 font-bold uppercase tracking-wider">
                                    Pronto para salvar
                                  </span>
                                </div>
                                <button
                                  onClick={() => setVideoUrls(prev => {
                                    const next = { ...prev };
                                    delete next[name];
                                    return next;
                                  })}
                                  className="text-[10px] text-zinc-500 hover:text-red-500 transition-colors font-bold uppercase"
                                >
                                  Remover
                                </button>
                              </div>
                            ) : (
                              <UploadButton
                                endpoint="workoutMedia"
                                onUploadBegin={() => setUpdatingName(name)}
                                onClientUploadComplete={(res) => {
                                  if (res && res[0]) {
                                    setVideoUrls(prev => ({ ...prev, [name]: res[0].url }));
                                  }
                                  setUpdatingName(null);
                                }}
                                onUploadError={() => {
                                  alert("Erro no upload");
                                  setUpdatingName(null);
                                }}
                                appearance={{
                                  button: "w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 py-2.5 h-auto text-[11px] font-black rounded-xl transition-all uppercase tracking-tighter italic",
                                  allowedContent: "hidden"
                                }}
                                content={{
                                  button: () => updatingName === name ? "Fazendo upload..." : "Selecionar Vídeo"
                                }}
                              />
                            )}
                          </div>
                          
                          <button
                            disabled={!videoUrls[name] || updatingName === name}
                            onClick={() => handleSave(name)}
                            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-20 disabled:cursor-not-allowed text-white w-12 h-11 rounded-xl flex items-center justify-center transition shadow-lg shadow-orange-500/20 active:scale-95"
                            title="Salvar globalmente"
                          >
                            {updatingName === name ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Save className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-zinc-950/50 border-t border-zinc-800 text-center">
                <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">
                  Gotoo Move Admin • Central de Mídia
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
