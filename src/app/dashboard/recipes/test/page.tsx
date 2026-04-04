import prisma from "@/lib/db";

export default async function TestPage() {
  const recipes = await prisma.recipe.findMany();
  return (
    <div className="p-10 bg-black text-white">
      <h1 className="text-2xl mb-4">Teste de Receitas ({recipes.length})</h1>
      <pre>{JSON.stringify(recipes, null, 2)}</pre>
    </div>
  );
}
