"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/users", label: "Gerenciar Alunos" },
    { href: "/admin/guests", label: "Gestão de Convidados", className: "text-blue-400 font-bold" },
    { href: "/admin/leads", label: "Gestão de Leads (Novo)", className: "text-green-400 font-bold" },
    { href: "/admin/workouts", label: "Fichas de Treino" },
    { href: "/admin/programs", label: "Programas (30 dias)", className: "text-orange-400 font-bold" },
    { href: "/admin/home-workouts", label: "Treinos em Casa", className: "text-blue-400 font-bold" },
    { href: "/admin/tips", label: "Dicas de Treino" },
    { href: "/admin/nutrition", label: "Alimentação" },
    { href: "/admin/recipes", label: "Receitas Fitness" },
    { href: "/", label: "Voltar ao Site", className: "text-zinc-500 hover:text-white" },
  ];

  return (
    <>
      {/* Botão Mobile */}
      <button 
        className="md:hidden fixed top-[80px] left-4 z-40 p-2 bg-zinc-900 border border-zinc-800 rounded-md text-white shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay Mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/80 z-40 backdrop-blur-sm" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 border-r border-zinc-800 p-6 min-h-screen bg-zinc-950 z-50 overflow-y-auto
        fixed md:sticky top-0 left-0 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="mb-8 flex items-center gap-2 mt-4 md:mt-0 pt-[80px] md:pt-0">
          <img src="/logo.png" alt="Logo" className="h-6 w-6 object-contain" />
          <h2 className="text-xl font-bold text-orange-500 leading-tight">Gotoo Move<br/><span className="text-sm text-zinc-400 font-normal">Admin</span></h2>
        </div>
        <nav className="space-y-1.5 pb-20 md:pb-0">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href}
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className={`block p-2.5 rounded transition text-sm ${link.className || ''} ${
                  isActive ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-900 text-zinc-300'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
