"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type ActionSuccess<T> = { success: true; data: T };
type ActionError = { success: false; error: string };
type ActionResult<T> = ActionSuccess<T> | ActionError;

export type StoreSettingsData = {
  id: string;
  whatsappNumber: string | null;
  facebookLink: string | null;
  heroMessage: string | null;
  updatedAt: Date;
};

export type UpdateSettingsInput = {
  whatsappNumber?: string | null;
  facebookLink?: string | null;
  heroMessage?: string | null;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return "Settings not found.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}

export async function getSettings(): Promise<ActionResult<StoreSettingsData>> {
  try {
    let settings = await prisma.storeSettings.findFirst();

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          whatsappNumber: null,
          facebookLink: null,
          heroMessage: null,
        },
      });
    }

    return { success: true, data: settings };
  } catch (error) {
    console.error("[getSettings]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateSettings(
  input: UpdateSettingsInput,
): Promise<ActionResult<StoreSettingsData>> {
  try {
    // هنجيب الـ ID بتاع أول إعداد موجود، لو مفيش هنفترض إننا بنعمل واحد جديد
    const existingSettings = await prisma.storeSettings.findFirst();

    // الـ Upsert: لو الـ ID موجود اعمل update، لو مش موجود اعمل create
    const updated = await prisma.storeSettings.upsert({
      where: {
        id: existingSettings?.id || "default-id", // لو فاضي هيفشل في الـ where ويدخل يعمله Create
      },
      update: {
        whatsappNumber: input.whatsappNumber?.trim() || null,
        facebookLink: input.facebookLink?.trim() || null,
        heroMessage: input.heroMessage?.trim() || null,
      },
      create: {
        whatsappNumber: input.whatsappNumber?.trim() || null,
        facebookLink: input.facebookLink?.trim() || null,
        heroMessage: input.heroMessage?.trim() || null,
      },
    });

    revalidatePath("/");

    return { success: true, data: updated };
  } catch (error) {
    console.error("[updateSettings]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}
