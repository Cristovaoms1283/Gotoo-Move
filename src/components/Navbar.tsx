"use client";

import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { Show, UserButton } from "@clerk/nextjs";
import { InstallPWA } from "./InstallPWA";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-10 w-10 flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="Gotoo Move Logo" 
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-2xl font-black tracking-tighter italic uppercase">
            Gotoo<span className="text-primary italic ml-1">Move</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/#features" className="hover:text-primary transition-colors">Treinos</Link>
          <Link href="/#pricing" className="hover:text-primary transition-colors">Planos</Link>
          <Link href="/#about" className="hover:text-primary transition-colors">Sobre</Link>
        </div>
        <div className="flex items-center gap-4">
          <InstallPWA />
          <Show when="signed-out">
            <Link href="/sign-in" className="text-sm font-medium hover:text-primary transition-colors">Login Aluno</Link>
            <Link href="/#pricing" className="btn-premium btn-primary !py-2 !px-6 !text-sm">
              Começar Agora
            </Link>
          </Show>
          <Show when="signed-in">
            <Link href="/admin" className="text-sm font-medium text-primary hover:underline transition-colors">Admin</Link>
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Meu Painel</Link>
            <UserButton />
          </Show>
        </div>
      </div>
    </nav>
  );
}
