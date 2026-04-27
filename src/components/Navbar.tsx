"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Dumbbell, LayoutDashboard, Shield, Menu, X } from "lucide-react";
import { Show, UserButton } from "@clerk/nextjs";
import { InstallPWA } from "./InstallPWA";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fecha o menu ao redimensionar para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navLinks = [
    { href: "/#features", label: "Treinos" },
    { href: "/#pricing", label: "Planos" },
    { href: "/#about", label: "Sobre" },
  ];

  if (!mounted) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 z-50">
          <div className="relative h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="Gotoo Move Logo" 
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-lg sm:text-2xl font-black tracking-tighter italic uppercase whitespace-nowrap">
            Gotoo<span className="text-primary italic ml-0.5 sm:ml-1">Move</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.label} 
              href={link.href} 
              className="hover:text-primary transition-colors font-medium text-sm"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-4 z-50">
          <div className="hidden md:block">
            <InstallPWA />
          </div>
          
          <Show when="signed-out">
            <Link href="/sign-in" className="text-sm font-bold text-white/90 hover:text-primary transition-colors flex items-center gap-1.5">
              Login Aluno
            </Link>
            <Link href="/#pricing" className="btn-premium btn-primary !py-1.5 !px-3 !text-[10px] sm:!py-2 sm:!px-6 sm:!text-sm">
              Começar Agora
            </Link>
          </Show>

          <Show when="signed-in">
            <Link href="/dashboard" className="hidden md:block text-sm font-medium hover:text-primary transition-colors">
              Meu Painel
            </Link>
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Link
                  label="Meu Painel"
                  labelIcon={<LayoutDashboard className="h-4 w-4" />}
                  href="/dashboard"
                />
                <UserButton.Link
                  label="Admin"
                  labelIcon={<Shield className="h-4 w-4" />}
                  href="/admin"
                />
              </UserButton.MenuItems>
            </UserButton>
          </Show>

          {/* Hamburger Button */}
          <button 
            className="md:hidden p-1.5 bg-white/5 border border-white/10 rounded-lg text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[280px] bg-zinc-950 border-l border-white/10 z-40 md:hidden p-8 pt-24 overflow-y-auto"
            >
              <div className="flex flex-col gap-6">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Navegação</p>
                {navLinks.map((link) => (
                  <Link 
                    key={link.label} 
                    href={link.href} 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-2xl font-black italic uppercase tracking-tight hover:text-primary transition-colors flex items-center justify-between group"
                  >
                    {link.label}
                    <div className="h-px w-0 group-hover:w-8 bg-primary transition-all duration-300" />
                  </Link>
                ))}
                
                <div className="h-px bg-white/10 my-4" />

                <div className="flex flex-col gap-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Aplicativo & Acesso</p>
                  <InstallPWA forceVisible={true} />
                  
                  <Show when="signed-out">
                    <Link 
                      href="/sign-in" 
                      onClick={() => setIsMenuOpen(false)}
                      className="text-lg font-bold text-white/70 hover:text-white transition-colors"
                    >
                      Login Aluno
                    </Link>
                  </Show>
                  
                  <Show when="signed-in">
                    <Link 
                      href="/dashboard" 
                      onClick={() => setIsMenuOpen(false)}
                      className="text-lg font-bold text-primary hover:underline transition-colors"
                    >
                      Meu Painel
                    </Link>
                    <Link 
                      href="/admin" 
                      onClick={() => setIsMenuOpen(false)}
                      className="text-lg font-bold text-white/70 hover:text-white transition-colors"
                    >
                      Painel Admin
                    </Link>
                  </Show>
                </div>
              </div>

              <div className="mt-12">
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-2">Suporte</p>
                  <p className="text-xs text-white/60">Precisa de ajuda com seu treino? Entre em contato pelo WhatsApp.</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
