"use client";

import { useState } from "react";
import { syncExerciseVideos } from "@/app/actions/workouts";
import { RefreshCw } from "lucide-react";

export default function SyncVideosButton() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      const result = await syncExerciseVideos();
      if (result.success) {
        alert(`Sincronização concluída! ${result.count} exercício(s) atualizado(s) com vídeos.`);
      }
    } catch (error) {
      console.error(error);
      alert("Ocorreu um erro ao sincronizar os vídeos.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={isSyncing}
      className={`flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 px-4 py-2 rounded-lg font-medium transition ${
        isSyncing ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
      {isSyncing ? "Sincronizando..." : "Sincronizar Vídeos"}
    </button>
  );
}
