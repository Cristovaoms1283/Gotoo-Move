"use client";

import { useEffect, useState } from "react";
import { Download, X, Share, Smartphone, Info, ChevronRight, Apple } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [activeTab, setActiveTab] = useState<"android" | "ios">("android");

  useEffect(() => {
    // Detecta se é iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);
    
    if (isIosDevice) {
      setActiveTab("ios");
    }

    // Verifica se já está instalado (standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

    // Se for iOS e não estiver instalado, mostramos o botão de qualquer forma
    if (isIosDevice && !isStandalone) {
      setIsVisible(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setIsVisible(false);
      setDeferredPrompt(null);
      setShowTutorial(false);
      toast.success("Aplicativo instalado com sucesso! 🎉");
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = () => {
    setShowTutorial(true);
  };

  const executeNativeInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsVisible(false);
      setShowTutorial(false);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] sm:text-[11px] uppercase font-black tracking-widest rounded-full transition-all border border-primary/20 group active:scale-95 whitespace-nowrap shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]"
        title="Instalar App no seu dispositivo"
      >
        <Download className="h-3 w-3 sm:h-4 sm:w-4 text-primary group-hover:bounce transition-transform" />
        <span>Baixar App</span>
      </button>

      <AnimatePresence>
        {showTutorial && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTutorial(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
                <div>
                  <h2 className="text-xl font-black uppercase italic tracking-tighter">Instalar Aplicativo</h2>
                  <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Siga os passos abaixo</p>
                </div>
                <button 
                  onClick={() => setShowTutorial(false)}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex p-2 bg-black/20 m-6 rounded-2xl border border-white/5">
                <button
                  onClick={() => setActiveTab("android")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    activeTab === "android" ? "bg-primary text-black shadow-lg" : "text-white/40 hover:text-white"
                  }`}
                >
                  <Smartphone size={16} />
                  Android
                </button>
                <button
                  onClick={() => setActiveTab("ios")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    activeTab === "ios" ? "bg-primary text-black shadow-lg" : "text-white/40 hover:text-white"
                  }`}
                >
                  <Apple size={16} />
                  iOS / iPhone
                </button>
              </div>

              {/* Content */}
              <div className="px-6 pb-8 overflow-y-auto custom-scrollbar">
                {activeTab === "android" ? (
                  <div className="space-y-6">
                    <div className="flex items-start gap-4 group">
                      <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-primary shrink-0">1</div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white/90">Abra o menu do Chrome</p>
                        <p className="text-xs text-white/40">Toque nos três pontinhos <span className="text-white font-bold">(⋮)</span> no canto superior direito do seu navegador.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 group">
                      <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-primary shrink-0">2</div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white/90">Instalar Aplicativo</p>
                        <p className="text-xs text-white/40">Procure e toque na opção <span className="text-white font-bold">"Instalar aplicativo"</span> ou <span className="text-white font-bold">"Adicionar à tela inicial"</span>.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 group">
                      <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-primary shrink-0">3</div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white/90">Confirme a Instalação</p>
                        <p className="text-xs text-white/40">Clique em instalar na janela que aparecerá. O ícone aparecerá na sua tela de apps!</p>
                      </div>
                    </div>

                    {deferredPrompt && (
                      <button
                        onClick={executeNativeInstall}
                        className="w-full mt-4 bg-primary hover:bg-primary-hover text-black font-black uppercase tracking-tighter italic py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary/20 active:scale-[0.98]"
                      >
                        <Download size={20} />
                        Instalar Agora
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-primary shrink-0">1</div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white/90">Toque em Compartilhar</p>
                        <p className="text-xs text-white/40">No Safari, toque no ícone de <span className="text-white font-bold">Compartilhar</span> <span className="inline-block p-1 bg-white/5 rounded border border-white/10"><Share size={12} className="inline text-primary" /></span> (quadrado com seta para cima).</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-primary shrink-0">2</div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white/90">Adicionar à Tela de Início</p>
                        <p className="text-xs text-white/40">Role as opções para baixo até encontrar <span className="text-white font-bold">"Adicionar à Tela de Início"</span>.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-primary shrink-0">3</div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white/90">Confirmar</p>
                        <p className="text-xs text-white/40">Toque em <span className="text-white font-bold">"Adicionar"</span> no canto superior direito para finalizar.</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Info size={20} className="text-primary" />
                      </div>
                      <p className="text-[10px] text-white/60 leading-relaxed font-medium">
                        <strong className="text-primary uppercase tracking-widest block mb-1">Dica de mestre:</strong>
                        Isso criará um ícone na sua tela inicial, permitindo que você acesse seus treinos instantaneamente como um app nativo.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 bg-black/40 border-t border-white/5 text-center">
                <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.2em]">Gotoo Move &copy; 2026</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
