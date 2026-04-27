"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { MouseEvent } from "react";
import Link from "next/link";
import { ArrowRight, Lock, LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  isLocked?: boolean;
}

export function DashboardCard({ title, description, icon: Icon, href, isLocked }: DashboardCardProps) {
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const background = useMotionTemplate`
    radial-gradient(
      450px circle at ${mouseX}px ${mouseY}px,
      rgba(var(--primary-rgb), 0.15),
      transparent 80%
    )
  `;

  return (
    <Link 
      href={isLocked ? "#" : href}
      className={`group relative block h-full ${isLocked ? 'cursor-not-allowed opacity-60' : ''}`}
      onMouseMove={handleMouseMove}
    >
      <div className={`relative h-full glass p-6 sm:p-8 rounded-[40px] border border-white/5 bg-white/[0.02] ${!isLocked ? 'hover:bg-white/[0.05]' : 'pointer-events-none'} transition-all duration-500 flex flex-col items-start gap-4 overflow-hidden`}>
        {/* Spotlight Effect */}
        {!isLocked && (
          <motion.div
            className="pointer-events-none absolute -inset-px rounded-[40px] opacity-0 transition duration-300 group-hover:opacity-100"
            style={{ background }}
          />
        )}
        
        <div className={`p-4 rounded-2xl bg-white/5 ${isLocked ? 'text-white/20' : 'text-primary group-hover:bg-primary group-hover:text-black'} transition-all duration-500 z-10`}>
            {isLocked ? <Lock className="h-8 w-8" /> : <Icon className="h-8 w-8" />}
        </div>
        
        <div className="z-10">
            <h2 className={`text-2xl font-black italic uppercase tracking-tight mb-2 flex items-center gap-2 ${isLocked ? 'text-white/40' : ''}`}>
                {title}
                {!isLocked && <ArrowRight className="h-5 w-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary" />}
                {isLocked && <Lock className="h-4 w-4 ml-auto text-primary/40" />}
            </h2>
            <p className="text-white/40 leading-relaxed text-sm max-w-[280px]">
                {isLocked ? "Conteúdo não disponível no seu plano atual." : description}
            </p>
        </div>

        <div className="mt-auto pt-4 z-10">
            <span className={`text-[10px] font-black uppercase tracking-widest ${isLocked ? 'text-white/20' : 'text-primary/50 group-hover:text-primary'} transition-colors italic`}>
                {isLocked ? "Fazer Upgrade" : "Acessar Conteúdo"}
            </span>
        </div>
      </div>
    </Link>
  );
}
