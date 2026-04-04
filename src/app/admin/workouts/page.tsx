import prisma from "@/lib/db";
import Link from "next/link";
import { deleteWorkout } from "@/app/actions/workouts";
import SyncVideosButton from "@/components/SyncVideosButton";
import NoVideoExercisesModal from "@/components/NoVideoExercisesModal";

export default async function AdminWorkouts() {
  const workouts = await prisma.workout.findMany({
    include: { _count: { select: { exercises: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gerenciar Treinos</h1>
        <div className="flex items-center gap-4">
          <NoVideoExercisesModal />
          <SyncVideosButton />
          <Link 
            href="/admin/workouts/new"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            Novo Treino
          </Link>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-800/50 text-zinc-400 text-sm">
              <th className="px-6 py-4">Título</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4">Exercícios</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {workouts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                  Nenhum treino cadastrado ainda.
                </td>
              </tr>
            ) : (
              workouts.map((workout) => (
                <tr key={workout.id} className="hover:bg-zinc-800/30 transition">
                  <td className="px-6 py-4 font-medium">{workout.title}</td>
                  <td className="px-6 py-4">
                    <span className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded text-xs uppercase tracking-wider">
                      {workout.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {workout._count.exercises} exercícios
                  </td>
                  <td className="px-6 py-4 text-right space-x-4">
                    <Link 
                      href={`/admin/workouts/${workout.id}`}
                      className="text-orange-500 hover:text-orange-400 text-sm font-bold uppercase transition"
                    >
                      Gerenciar Exercícios
                    </Link>
                    <form action={async () => {
                      "use server";
                      await deleteWorkout(workout.id);
                    }} className="inline">
                      <button className="text-zinc-600 hover:text-red-500 text-sm font-medium transition">
                        Excluir
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
