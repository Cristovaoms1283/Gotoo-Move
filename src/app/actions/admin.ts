"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";

// --- Dicas de Treino (Tips) ---
export async function createTip(formData: FormData) {
  await checkAdmin();
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const category = formData.get("category") as string || "musculacao";

  await prisma.tip.create({
    data: { title, content, category },
  });

  revalidatePath("/admin/tips");
  revalidatePath("/dashboard/tips");
  redirect("/admin/tips");
}

export async function deleteTip(id: string) {
  await checkAdmin();
  await prisma.tip.delete({ where: { id } });
  revalidatePath("/admin/tips");
}

// --- Nutrição (Nutrition) ---
export async function createNutrition(formData: FormData) {
  await checkAdmin();
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const category = formData.get("category") as string || "horarios";

  await prisma.nutrition.create({
    data: { title, content, category },
  });

  revalidatePath("/admin/nutrition");
  revalidatePath("/dashboard/nutrition");
  redirect("/admin/nutrition");
}

export async function deleteNutrition(id: string) {
  await checkAdmin();
  await prisma.nutrition.delete({ where: { id } });
  revalidatePath("/admin/nutrition");
}

// --- Receitas (Recipes) ---
export async function createRecipe(formData: FormData) {
  await checkAdmin();
  const title = formData.get("title") as string;
  const ingredients = formData.get("ingredients") as string;
  const instructions = formData.get("instructions") as string;
  const calories = formData.get("calories") ? parseInt(formData.get("calories") as string) : null;
  const imageUrl = formData.get("imageUrl") as string;
  const category = formData.get("category") as string || "pre-treino";

  await prisma.recipe.create({
    data: { 
      title, 
      ingredients, 
      instructions, 
      calories,
      imageUrl,
      category
    },
  });

  revalidatePath("/admin/recipes");
  revalidatePath("/dashboard/recipes");
  redirect("/admin/recipes");
}

export async function deleteRecipe(id: string) {
  await checkAdmin();
  await prisma.recipe.delete({ where: { id } });
  revalidatePath("/admin/recipes");
}
