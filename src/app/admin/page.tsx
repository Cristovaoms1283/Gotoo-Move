import prisma from "@/lib/db";

export default async function AdminDashboard() {
  let userCount = 0, workoutCount = 0, planCount = 0, tipCount = 0, nutritionCount = 0, recipeCount = 0;

  try {
    const results = await Promise.all([
      (prisma.user as any)?.count() || 0,
      (prisma.workout as any)?.count() || 0,
      (prisma.plan as any)?.count() || 0,
      (prisma.tip as any)?.count() || 0,
      (prisma.nutrition as any)?.count() || 0,
      (prisma.recipe as any)?.count() || 0,
    ]);

    [userCount, workoutCount, planCount, tipCount, nutritionCount, recipeCount] = results;
  } catch (error) {
    console.error("Erro ao carregar dados do dashboard:", error);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard Administrativo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <p className="text-zinc-400 text-sm mb-1">Total de Usuários</p>
          <p className="text-4xl font-bold">{userCount}</p>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <p className="text-zinc-400 text-sm mb-1">Programas de Treino</p>
          <p className="text-4xl font-bold">{workoutCount}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <p className="text-zinc-400 text-sm mb-1">Dicas & Conteúdos</p>
          <p className="text-4xl font-bold">{tipCount + nutritionCount + recipeCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <h2 className="text-xl font-bold mb-2 uppercase italic flex items-center gap-2">
            Gestão de <span className="text-primary">Conteúdo</span>
          </h2>
          <p className="text-zinc-400 text-sm mb-6">Controle as fichas de treino, exercícios e bibliotecas de vídeo.</p>
          <div className="flex gap-4">
             <a href="/admin/workouts" className="px-4 py-2 bg-zinc-800 hover:bg-primary hover:text-black rounded-lg text-xs font-black uppercase transition-all italic">Treinos</a>
             <a href="/admin/programs" className="px-4 py-2 bg-zinc-800 hover:bg-primary hover:text-black rounded-lg text-xs font-black uppercase transition-all italic">Programas</a>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <h2 className="text-xl font-bold mb-2 uppercase italic flex items-center gap-2">
            Sistema de <span className="text-primary">Rewards</span>
          </h2>
          <p className="text-zinc-400 text-sm mb-6">Cadastre prêmios, vouchers e brindes que os alunos podem resgatar.</p>
          <div className="flex gap-4">
             <a href="/admin/rewards" className="px-4 py-2 bg-primary text-black rounded-lg text-xs font-black uppercase transition-all italic hover:scale-105">Gerenciar Prêmios</a>
          </div>
        </div>
      </div>
    </div>
  );
}
