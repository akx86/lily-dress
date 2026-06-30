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

// ضفنا الـ Type الخاص بالتعديل
export type UpdateCategoryInput = {
  id: string;
  name: string;
  slug: string;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = (error.meta?.target as string[])?.join(", ") ?? "field";
      return `A category with this ${target} already exists.`;
    }
    // هندسة البيانات: حماية ضد حذف قسم مرتبط بفساتين
    if (error.code === "P2003") {
      return "Cannot delete this category. It is currently linked to one or more dresses. Please reassign or delete the dresses first.";
    }
    if (error.code === "P2025") {
      return "Category not found.";
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

    // مسح الكاش من الجذور عشان الـ Navbar والصفحات التانية تتحدث
    revalidatePath("/", "layout");

    return { success: true, data: category };
  } catch (error) {
    console.error("[addCategory]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateCategory(
  input: UpdateCategoryInput,
): Promise<ActionResult<CategoryData>> {
  try {
    const { id, name, slug } = input;

    if (!id?.trim())
      return { success: false, error: "Category ID is required." };
    if (!name?.trim()) return { success: false, error: "Name is required." };
    if (!slug?.trim()) return { success: false, error: "Slug is required." };

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        slug: slug.trim(),
      },
      select: { id: true, name: true, slug: true },
    });

    revalidatePath("/", "layout");

    return { success: true, data: category };
  } catch (error) {
    console.error("[updateCategory]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteCategory(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    if (!id?.trim())
      return { success: false, error: "Category ID is required." };

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/", "layout");

    return { success: true, data: { id } };
  } catch (error) {
    console.error("[deleteCategory]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}
