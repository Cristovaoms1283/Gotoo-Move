import prisma from "@/lib/db";
import { 
  Users, 
  MessageCircle, 
  Mail, 
  Calendar,
  Search,
  ChevronRight,
  UserPlus
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-500 font-bold uppercase tracking-widest text-xs">
            <UserPlus className="h-4 w-4" />
            CRM & Marketing
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase sm:text-5xl">
            GESTÃO DE <span className="text-blue-500">LEADS</span>
          </h1>
          <p className="text-zinc-400 font-medium max-w-lg">
            Acompanhe e entre em contato com os interessados na sua Aula Experimental.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-zinc-900 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total Capturado</p>
              <p className="text-xl font-black text-white">{leads.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-[32px] overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-8 py-6 text-xs font-bold text-zinc-500 uppercase tracking-widest">Interessado</th>
                <th className="px-8 py-6 text-xs font-bold text-zinc-500 uppercase tracking-widest">WhatsApp</th>
                <th className="px-8 py-6 text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-6 text-xs font-bold text-zinc-500 uppercase tracking-widest">Data</th>
                <th className="px-8 py-6 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-zinc-500 font-medium">
                    Nenhum lead capturado ainda. Divulgue sua landing page para começar!
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center font-bold text-blue-500 uppercase">
                          {lead.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-bold tracking-tight">{lead.name}</span>
                          <span className="text-xs text-zinc-500 font-medium flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-zinc-300 font-medium">
                        <MessageCircle className="h-4 w-4 text-green-500" />
                        {lead.whatsapp}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          lead.isConfirmed 
                            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                            : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        }`}>
                          {lead.isConfirmed ? 'Confirmado' : 'Aguardando'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(lead.createdAt), "dd MMM, yy", { locale: ptBR })}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <a 
                        href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all hover:scale-105"
                      >
                        Chamar
                        <ChevronRight className="h-4 w-4" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
