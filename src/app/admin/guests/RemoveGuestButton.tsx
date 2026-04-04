"use client";

import { useState } from "react";
import { removeGuest } from "@/app/actions/guests";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";

export function RemoveGuestButton({ userId }: { userId: string }) {
  const [isPending, setIsPending] = useState(false);

  async function handleRemove() {
    if (!confirm("Tem certeza que deseja remover o acesso deste bolsista?")) return;

    setIsPending(true);
    const res = await removeGuest(userId);
    setIsPending(false);

    if (res.success) {
      toast.success("Acesso removido com sucesso!");
    } else {
      toast.error(res.error || "Erro ao remover acesso.");
    }
  }

  return (
    <button
      onClick={handleRemove}
      disabled={isPending}
      className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
      title="Remover Acesso de Bolsista"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  );
}
