"use client";

import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  Smartphone, 
  Mail, 
  MapPin, 
  MoreVertical,
  ChevronRight
} from "./Icons";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function LeadsTableClient({ leads }: any) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLeads = leads.filter((l: any) => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.whatsapp.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 h-4 w-4" />
          <input 
            type="text"
            placeholder="Buscar leads reais..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="bg-zinc-900/40 border border-white/5 rounded-[32px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-zinc-900/20">
                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Candidato</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Contato</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Origem</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLeads.map((lead: any) => (
                <tr key={lead.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center font-bold text-cyan-500">
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white tracking-tight">{lead.name}</p>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase">{format(new Date(lead.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                        <Smartphone size={12} className="text-green-500" />
                        {lead.whatsapp}
                      </span>
                      <span className="text-[10px] font-medium text-zinc-500 flex items-center gap-2">
                        <Mail size={12} />
                        {lead.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-zinc-800 rounded-lg text-[9px] font-black uppercase tracking-widest text-zinc-400">
                      {lead.source || "Direto"}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        lead.status === 'Fechado' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        lead.status === 'Novo' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                        'bg-zinc-500/10 text-zinc-400 border-white/10'
                      }`}>
                        {lead.status || "Pendente"}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <a 
                      href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      className="p-2 bg-green-500 text-black rounded-lg inline-block"
                    >
                      <Smartphone size={16} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
