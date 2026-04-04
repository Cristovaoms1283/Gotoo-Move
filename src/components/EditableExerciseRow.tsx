"use client";

import { useState, useTransition, useEffect } from "react";
import { Trash2, Edit2, Save, X } from "lucide-react";
import { updateExercise, deleteExercise } from "@/app/actions/workouts";
import { useRouter } from "next/navigation";
import { UploadButton } from "@/utils/uploadthing";

interface Exercise {
  id: string;
  name: string;
  description?: string | null;
  sets?: string | null;
  reps?: string | null;
  rest?: string | null;
  isGironda?: boolean;
  youtubeId?: string | null;
  videoProvider?: string;
}

interface EditableExerciseRowProps {
  exercise: Exercise;
  workoutId: string;
  index: number;
}

export default function EditableExerciseRow({ exercise, workoutId, index }: EditableExerciseRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: exercise.name,
    description: exercise.description || "",
    sets: exercise.sets || "",
    reps: exercise.reps || "",
    rest: exercise.rest || "",
    isGironda: exercise.isGironda || false,
    youtubeId: exercise.youtubeId || "",
    videoProvider: "upload",
  });

  useEffect(() => {
    setFormData({
      name: exercise.name,
      description: exercise.description || "",
      sets: exercise.sets || "",
      reps: exercise.reps || "",
      rest: exercise.rest || "",
      isGironda: exercise.isGironda || false,
      youtubeId: exercise.youtubeId || "",
      videoProvider: "upload",
    });
  }, [exercise]);

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateExercise(exercise.id, workoutId, formData);
        setIsEditing(false);
        router.refresh(); // Refresh to ensure changes reflect across layouts if needed
      } catch (error) {
        console.error("Erro ao atualizar exercício:", error);
        alert("Falha ao salvar. Tente novamente.");
      }
    });
  };

  if (isEditing) {
    return (
      <tr className="bg-zinc-800/50 transition-colors border-y border-zinc-500/30">
        <td className="px-6 py-4 text-center font-black italic text-orange-500/50">
          {index + 1}
        </td>
        <td className="px-6 py-4 space-y-2">
          <input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-sm text-white focus:border-orange-500 outline-none"
            placeholder="Nome do Exercício"
          />
          <input
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-xs text-white focus:border-orange-500 outline-none"
            placeholder="Observações (opcional)"
          />
          <div className="flex items-center gap-2 pt-1">
             <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.isGironda}
                  onChange={(e) => setFormData({ ...formData, isGironda: e.target.checked })}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-orange-500 focus:ring-orange-500 focus:ring-offset-zinc-900" 
                />
                <span className="text-[10px] font-bold text-orange-500 uppercase">Metodologia Gironda (8x8)</span>
             </label>
          </div>
        </td>
        <td className="px-6 py-4 text-center">
          <input
            value={formData.sets}
            onChange={(e) => setFormData({ ...formData, sets: e.target.value })}
            className="w-16 bg-zinc-950 border border-zinc-700 rounded p-2 text-sm text-center text-white focus:border-orange-500 outline-none mx-auto"
            placeholder="Sér."
          />
        </td>
        <td className="px-6 py-4 text-center">
          <input
            value={formData.reps}
            onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
            className="w-16 bg-zinc-950 border border-zinc-700 rounded p-2 text-sm text-center text-white focus:border-orange-500 outline-none mx-auto"
            placeholder="Rep."
          />
        </td>
        <td className="px-6 py-4 text-center">
          <input
            value={formData.rest}
            onChange={(e) => setFormData({ ...formData, rest: e.target.value })}
            className="w-16 bg-zinc-950 border border-zinc-700 rounded p-2 text-sm text-center text-white focus:border-orange-500 outline-none mx-auto"
            placeholder="Desc."
          />
        </td>
        <td className="px-6 py-4 text-center sm:text-right">
          <div className="flex flex-col gap-2 items-center justify-end sm:flex-row">
            <div className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 flex flex-col items-center gap-2 relative">
              {(formData.youtubeId && formData.youtubeId.startsWith("http")) ? (
                  <div className="text-[10px] text-green-500 font-bold truncate w-full text-center flex items-center justify-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Anexado!
                    <button 
                      type="button" 
                      onClick={() => setFormData({ ...formData, youtubeId: "" })}
                      className="ml-1 text-[8px] text-zinc-500 hover:text-white underline"
                    >
                      Trocar
                    </button>
                  </div>
              ) : (
                <UploadButton
                  endpoint="workoutMedia"
                  onClientUploadComplete={(res) => {
                    if (res && res[0]) {
                      setFormData({ ...formData, youtubeId: res[0].url });
                      alert("Upload concluído com sucesso!");
                    }
                  }}
                  onUploadError={(error: Error) => {
                    alert(`Erro no upload: ${error.message}`);
                  }}
                  appearance={{
                    button: "bg-orange-500 text-black text-[10px] font-bold py-1 px-4 h-8 rounded shrink-0",
                    allowedContent: "hidden"
                  }}
                />
              )}
            </div>
            
            <div className="flex justify-end items-center gap-1 sm:flex-col lg:flex-row mt-2 sm:mt-0">
              <button
                onClick={() => setIsEditing(false)}
                className="h-9 w-9 xl:h-10 xl:w-10 rounded-lg flex items-center justify-center bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition"
                disabled={isPending}
                title="Cancelar"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                onClick={handleSave}
                className="h-9 w-9 xl:h-10 xl:w-10 rounded-lg flex items-center justify-center bg-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-black transition"
                disabled={isPending}
                title="Salvar Alterações"
              >
                <Save className="h-4 w-4" />
              </button>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-zinc-800/30 transition-colors group">
      <td className="px-6 py-4 text-center font-black italic text-orange-500/50">
        {index + 1}
      </td>
      <td className="px-6 py-4">
        <div>
          <p className="font-bold text-white group-hover:text-orange-500 transition-colors uppercase italic tracking-tighter">{exercise.name}</p>
          {exercise.isGironda && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="px-1.5 py-0.5 bg-orange-500 text-black text-[9px] font-black italic rounded flex items-center gap-1 uppercase tracking-tighter">
                <span className="animate-pulse">⚡</span> Gironda 8x8
              </span>
            </div>
          )}
          <p className="text-[10px] text-zinc-500 line-clamp-1 mt-1">{exercise.description || 'Sem observações'}</p>
        </div>
      </td>
      <td className="px-6 py-4 text-center font-mono text-zinc-300">
        {exercise.isGironda ? <span className="text-orange-500 font-bold">8</span> : (exercise.sets || '-')}
      </td>
      <td className="px-6 py-4 text-center font-mono text-zinc-300">
        {exercise.isGironda ? <span className="text-orange-500 font-bold">8</span> : (exercise.reps || '-')}
      </td>
      <td className="px-6 py-4 text-center font-mono text-zinc-300">
        {exercise.isGironda ? <span className="text-orange-500 font-bold">30s</span> : (exercise.rest || '-')}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end items-center gap-2">
          <div className="h-6 w-6 bg-zinc-950 rounded flex items-center justify-center text-[8px] font-bold text-zinc-600 border border-zinc-800" title="Upload Local">
            UPL
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-600 hover:bg-zinc-800 hover:text-white transition-all"
            title="Editar Exercício"
          >
             <Edit2 className="h-4 w-4" />
          </button>
          <form>
            <button 
              formAction={async () => {
                startTransition(async () => {
                    await deleteExercise(exercise.id, workoutId);
                })
              }}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-600 hover:bg-red-500/10 hover:text-red-500 transition-all"
              title="Excluir Exercício"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}
