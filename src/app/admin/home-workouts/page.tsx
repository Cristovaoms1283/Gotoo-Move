import prisma from "@/lib/db";
import Link from "next/link";
import { deleteHomeWorkout } from "@/app/actions/home-workouts";
import { PlayCircle, Trash2, Edit } from "lucide-react";

export default async function AdminHomeWorkouts() {
  const workouts = await prisma.homeWorkout.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <PlayCircle className="text-blue-500 h-8 w-8" />
            Gerenciar Treinos em Casa
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Aulas HIIT de 30 minutos vinculadas ao YouTube.</p>
        </div>
        <Link 
          href="/admin/home-workouts/new"
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] flex items-center gap-2"
        >
          Novo Vídeo
        </Link>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl overflow-hidden backdrop-blur-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-widest font-black">
              <th className="px-6 py-4">Ordem</th>
              <th className="px-6 py-4">Título do Treino</th>
              <th className="px-6 py-4">Instrutor</th>
              <th className="px-6 py-4">Nível/Calorias</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {workouts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 italic">
                  Nenhuma aula de HIIT cadastrada ainda.
                </td>
              </tr>
            ) : (
              workouts.map((workout) => (
                <tr key={workout.id} className="hover:bg-zinc-800/30 transition group">
                  <td className="px-6 py-4 font-black text-zinc-500">{workout.order}</td>
                  <td className="px-6 py-4 font-bold text-white">{workout.title}</td>
                  <td className="px-6 py-4 text-zinc-400">{workout.instructor}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-blue-400">{workout.level}</span>
                      <span className="text-[10px] text-zinc-500">{workout.calories}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <Link 
                      href={`/admin/home-workouts/${workout.id}`}
                      className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition bg-zinc-800 p-2 rounded-lg"
                      title="Editar Vídeo"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <form action={async () => {
                      "use server";
                      await deleteHomeWorkout(workout.id);
                    }} className="inline">
                      <button 
                        className="inline-flex items-center gap-2 text-zinc-500 hover:text-red-500 transition bg-zinc-800 hover:bg-red-500/10 p-2 rounded-lg"
                        title="Excluir Vídeo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
