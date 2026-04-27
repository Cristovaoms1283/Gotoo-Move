"use client";

import React, { useState, useEffect } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Users, 
  Target, 
  TrendingUp, 
  DollarSign, 
  Filter, 
  RefreshCw, 
  ExternalLink,
  ChevronRight,
  Search,
  Plus,
  MoreVertical,
  PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Calendar,
  MapPin,
  Mail,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  MetaIcon,
  GoogleIcon,
  TikTokIcon
} from "./Icons";
import { toast } from "sonner";
import LeadsTableClient from "./LeadsTableClient";

export default function TrafficDashboardClient({ kpis, chartData, sourceStats, leads }: any) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [period, setPeriod] = useState("Últimos 7 dias");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const sourceData = [
    { name: "Meta Ads", value: sourceStats.meta, color: "#06b6d4" },
    { name: "Google Ads", value: sourceStats.google, color: "#3b82f6" },
    { name: "TikTok Ads", value: sourceStats.tiktok, color: "#f43f5e" },
    { name: "Orgânico", value: sourceStats.organico, color: "#10b981" },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload(); // Refresh simples para buscar dados reais do servidor
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* HEADER PREMIUM */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Target className="text-black h-6 w-6 font-bold" />
            </div>
            <div>
              <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none">
                CENTRAL <span className="text-cyan-400">TRAFFIC</span>
              </h1>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-1">
                Gestão de Performance & Leads Reais
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option>Hoje</option>
              <option>Últimos 7 dias</option>
              <option>Últimos 30 dias</option>
              <option>Total</option>
            </select>

            <button 
              onClick={handleRefresh}
              className={`p-2 bg-zinc-900 border border-white/10 rounded-xl hover:bg-zinc-800 transition-all ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`}
            >
              <RefreshCw size={18} />
            </button>

            <button className="bg-white text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-cyan-400 transition-all">
              Novo Lead
            </button>
          </div>
        </div>

        {/* NAVEGAÇÃO DE ABAS */}
        <nav className="max-w-7xl mx-auto mt-6 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: "dashboard", label: "Dashboard", icon: PieChartIcon },
            { id: "leads", label: "Gestão de Leads", icon: Users },
            { id: "ads", label: "Métricas Ads", icon: Target },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? "bg-cyan-500 text-black" 
                  : "bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Leads Totais", value: kpis.totalLeads, icon: Users, color: "text-cyan-400" },
                { label: "Confirmados", value: kpis.confirmedLeads, icon: CheckCircle2, color: "text-green-400" },
                { label: "Taxa Conversão", value: `${kpis.conversionRate}%`, icon: TrendingUp, color: "text-purple-400" },
                { label: "Faturamento Real", value: `R$ ${kpis.totalRevenue.toLocaleString('pt-BR')}`, icon: DollarSign, color: "text-emerald-400" },
              ].map((kpi, i) => (
                <div key={i} className="bg-zinc-900/40 border border-white/5 p-5 rounded-[24px]">
                  <div className={`p-2 w-fit rounded-xl bg-zinc-800 ${kpi.color} mb-4`}>
                    <kpi.icon size={20} />
                  </div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{kpi.label}</p>
                  <p className="text-2xl font-black mt-1 tracking-tighter">{kpi.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-zinc-900/40 border border-white/5 p-6 rounded-[32px] h-[400px]">
                <h3 className="text-lg font-black italic uppercase mb-8">Evolução de Captação</h3>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', borderRadius: '16px' }} />
                      <Area type="monotone" dataKey="leads" stroke="#06b6d4" strokeWidth={3} fill="url(#colorLeads)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-[32px]">
                <h3 className="text-lg font-black italic uppercase mb-4 text-center">Origens Reais</h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={sourceData} innerRadius={60} outerRadius={80} dataKey="value">
                        {sourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {sourceData.map((item, i) => (
                    <div key={i} className="bg-white/5 p-2 rounded-xl text-center">
                      <p className="text-[9px] font-black text-zinc-500 uppercase">{item.name}</p>
                      <p className="text-sm font-black" style={{ color: item.color }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "leads" && (
          <LeadsTableClient leads={leads} />
        )}

        {activeTab === "ads" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AdsCard title="Meta Ads" icon={MetaIcon} color="bg-blue-600" />
            <AdsCard title="Google Ads" icon={GoogleIcon} color="bg-white" textColor="text-black" />
            <AdsCard title="TikTok Ads" icon={TikTokIcon} color="bg-red-600" />
          </div>
        )}
      </main>
    </div>
  );
}

function AdsCard({ title, icon: Icon, color, textColor = "text-white" }: any) {
  return (
    <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[32px] flex flex-col items-center text-center">
      <div className={`w-16 h-16 ${color} ${textColor} rounded-2xl flex items-center justify-center mb-6`}>
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-black italic uppercase mb-2">{title}</h3>
      <p className="text-zinc-500 text-sm mb-6">Conexão via API ativa</p>
      <button className="w-full bg-zinc-800 text-white py-4 rounded-2xl text-xs font-black uppercase hover:bg-zinc-700 transition-all">
        Ver Detalhes
      </button>
    </div>
  );
}
