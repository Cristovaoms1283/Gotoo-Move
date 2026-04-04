import { getGuests } from "@/app/actions/guests";
import { AddGuestForm } from "./AddGuestForm";
import { RemoveGuestButton } from "./RemoveGuestButton";
import { UserCheck, Mail, Calendar, ShieldCheck } from "lucide-react";

export default async function AdminGuestsPage() {
  const guests = await getGuests();

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="h-8 w-8 text-blue-500" />
          <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase text-white">
            GESTÃO DE <span className="text-blue-500">BOLSISTAS</span>
          </h1>
        </div>
        <p className="text-white/60 font-medium">
          Controle quem tem acesso gratuito e vitalício à plataforma FitConnect.
        </p>
      </header>

      <AddGuestForm />

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
          <h2 className="font-bold text-white flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-500" />
            Lista de Convidados Ativos
          </h2>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest bg-zinc-800 px-3 py-1 rounded-full">
            {guests.length} {guests.length === 1 ? "Bolsista" : "Bolsistas"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-950 text-zinc-500 text-[10px] uppercase font-black tracking-widest border-b border-zinc-800">
                <th className="px-8 py-5">Nome / Identificação</th>
                <th className="px-8 py-5">E-mail de Acesso</th>
                <th className="px-8 py-5">Data de Início</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {guests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-zinc-600 italic">
                    Nenhum bolsista cadastrado no momento.
                  </td>
                </tr>
              ) : (
                guests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-sm">
                          {guest.name?.charAt(0) || "G"}
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">{guest.name}</p>
                          {guest.clerkId.startsWith('pending') && (
                            <span className="text-[10px] text-yellow-500/70 font-bold uppercase tracking-tight bg-yellow-500/5 px-2 py-0.5 rounded border border-yellow-500/10">
                              Aguardando Cadastro
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-zinc-400 text-sm">
                        <Mail className="h-4 w-4 opacity-50" />
                        {guest.email}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-zinc-400 text-sm">
                        <Calendar className="h-4 w-4 opacity-50" />
                        {new Date(guest.createdAt).toLocaleDateString("pt-BR")}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <RemoveGuestButton userId={guest.id} />
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
