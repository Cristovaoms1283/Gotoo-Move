"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, Utensils, User, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function MobileBottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const navItems = [
    { icon: Home, label: "Home", href: "/dashboard" },
    { icon: Dumbbell, label: "Treino", href: "/dashboard/workouts?type=gym" },
    { icon: Flame, label: "HIIT", href: "/treino-em-casa" },
    { icon: Utensils, label: "Dieta", href: "/dashboard/nutrition" },
    { icon: User, label: "Perfil", href: "/dashboard/onboarding" },
  ];

  // Só mostra no mobile e dentro do dashboard ou áreas de treino
  const showNav = pathname?.includes("/dashboard") || pathname?.includes("/treino-em-casa");

  if (!showNav) return null;

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe"
    >
      <div className="mx-4 mb-4 glass rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        <nav className="flex items-center justify-around p-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.includes(item.href));
            
            return (
              <Link 
                key={item.label} 
                href={item.href}
                className="relative flex flex-col items-center gap-1 p-2 min-w-[64px]"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 rounded-2xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-white/40"}`} />
                <span className={`text-[10px] font-bold uppercase tracking-tighter ${isActive ? "text-primary" : "text-white/40"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </motion.div>
  );
}
