"use client";

import { useState } from "react";
import { addGuest } from "@/app/actions/guests";
import { toast } from "sonner";
import { UserPlus, Loader2 } from "lucide-react";

export function AddGuestForm() {
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setIsPending(true);
    const res = await addGuest(email);
    setIsPending(false);

    if (res.success) {
      toast.success("Bolsista adicionado com sucesso!");
      setEmail("");
    } else {
      toast.error(res.error || "Erro ao adicionar bolsista.");
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <UserPlus className="h-5 w-5 text-blue-500" />
        Convidar Novo Bolsista
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          placeholder="email-do-bolsista@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-white hover:bg-blue-500 hover:text-white text-black font-black uppercase tracking-widest px-8 py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Convidar"
          )}
        </button>
      </form>
      <p className="mt-4 text-xs text-zinc-500 font-medium">
        Se o usuário já existir, ele será marcado como bolsista imediatamente. <br />
        Se for um novo usuário, ele receberá um e-mail de convite do Clerk.
      </p>
    </div>
  );
}
