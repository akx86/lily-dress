"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type ActionSuccess<T> = { success: true; data: T };
type ActionError = { success: false; error: string };
type ActionResult<T> = ActionSuccess<T> | ActionError;

export type CategoryData = {
  id: string;
  name: string;
  slug: string;
};

export type AddCategoryInput = {
  name: string;
  slug: string;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = (error.meta?.target as string[])?.join(", ") ?? "field";
      return `A category with this ${target} already exists.`;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}

export async function getAllCategories(): Promise<
  ActionResult<CategoryData[]>
> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    });

    return { success: true, data: categories };
  } catch (error) {
    console.error("[getAllCategories]", error);
    return { success: false, error: "Failed to load categories." };
  }
}

export async function addCategory(
  input: AddCategoryInput,
): Promise<ActionResult<CategoryData>> {
  try {
    const { name, slug } = input;

    if (!name?.trim()) return { success: false, error: "Name is required." };
    if (!slug?.trim()) return { success: false, error: "Slug is required." };

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: slug.trim(),
      },
      select: { id: true, name: true, slug: true },
    });
    revalidatePath("/categories");
    revalidatePath("/dresses");

    return { success: true, data: category };
  } catch (error) {
    console.error("[addCategory]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}
