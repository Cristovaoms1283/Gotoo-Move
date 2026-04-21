"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detecta se é iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Verifica se já está instalado (standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

    if (isIosDevice && !isStandalone) {
      setIsVisible(true);
    }

    const handler = (e: any) => {
      // Impede o Chrome de mostrar o prompt automático
      e.preventDefault();
      // Salva o evento para ser usado depois
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Verifica se já está instalado
    window.addEventListener("appinstalled", () => {
      setIsVisible(false);
      setDeferredPrompt(null);
      toast.success("Aplicativo instalado com sucesso! 🎉");
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      toast.info("Para instalar: toque no ícone de Compartilhar no navegador e depois em 'Adicionar à Tela de Início' 📱", {
        duration: 8000,
      });
      return;
    }

    if (!deferredPrompt) return;

    // Mostra o prompt de instalação nativo
    deferredPrompt.prompt();

    // Aguarda a escolha do usuário
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      toast.info("Iniciando instalação...");
    }

    // Limpa o evento, pois ele só pode ser usado uma vez
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white/5 hover:bg-white/10 text-white text-[9px] sm:text-[10px] uppercase font-bold tracking-widest rounded-full transition-all border border-white/10 group active:scale-95 whitespace-nowrap"
      title="Instalar App no seu dispositivo"
    >
      <Download className="h-3 w-3 sm:h-3 sm:w-3 text-primary group-hover:scale-110 transition-transform hidden sm:block" />
      <span>Instalar App</span>
    </button>
  );
}
