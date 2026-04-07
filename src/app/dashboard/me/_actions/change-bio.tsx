"use server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const changeDescriptionchema = z.object({
  description: z
    .string()
    .min(4, "A descricao precisa ter no minimo 4 caracteres"),
});

type ChangeDescriptionSchema = z.infer<typeof changeDescriptionchema>;

export async function changeDescription(data: ChangeDescriptionSchema) {
  const session = await auth();
  const userId = session?.user.id;

  if (!userId) {
    return {
      data: null,
      error: "Usuário não autenticado",
    };
  }

  const schema = changeDescriptionchema.safeParse(data);

  if (!schema.success) {
    return {
      data: null,
      error: schema.error.issues[0].message,
    };
  }

  try {
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        bio: data.description,
      },
    });

    return {
      data: user.name,
      error: null,
    };
  } catch (err) {
    console.log(err);
    return {
      data: null,
      error: "Falha ao salvar alterações.",
    };
  }
}
