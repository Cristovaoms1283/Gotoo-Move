import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
  workoutMedia: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
    video: { maxFileSize: "32MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      // Verifica se há um usuário válido autenticado
      const { userId } = await auth();
      if (!userId) throw new Error("Não autorizado");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload concluído para o usuário:", metadata.userId);
      console.log("URL do arquivo:", file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  rewardImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) throw new Error("Não autorizado");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload de Prêmio concluído:", file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
