"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
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
      className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] uppercase font-bold tracking-widest rounded-full transition-all border border-white/10 group active:scale-95"
      title="Instalar App no seu dispositivo"
    >
      <Download className="h-3 w-3 text-primary group-hover:scale-110 transition-transform" />
      <span>Instalar App</span>
    </button>
  );
}
