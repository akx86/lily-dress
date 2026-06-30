"use server";

import { DressStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type ActionSuccess<T> = { success: true; data: T };
type ActionError = { success: false; error: string };
type ActionResult<T> = ActionSuccess<T> | ActionError;

export type AddDressInput = {
  title: string;
  slug: string;
  description: string;
  price?: number | string | null;
  size: string;
  color: string;
  status?: DressStatus;
  categoryId: string;
  imageUrl: string;
};

export type UpdateDressInput = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price?: number | string | null;
  size: string;
  color: string;
  status?: DressStatus;
  categoryId: string;
  imageUrl?: string;
};

const dressInclude = {
  category: true,
  images: { orderBy: { createdAt: "asc" as const } },
} satisfies Prisma.DressInclude;

type DressWithRelations = Prisma.DressGetPayload<{
  include: typeof dressInclude;
}>;

function serializeDress(dress: DressWithRelations) {
  return {
    ...dress,
    price: dress.price !== null ? dress.price.toString() : null,
  };
}

export type SerializedDress = ReturnType<typeof serializeDress>;

function getErrorMessage(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = (error.meta?.target as string[])?.join(", ") ?? "field";
      return `A dress with this ${target} already exists.`;
    }
    if (error.code === "P2003") {
      return "Invalid category. The selected category does not exist.";
    }
    if (error.code === "P2025") {
      return "Dress not found.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}

function revalidateDressPaths(slug: string, previousSlug?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/dresses", "page");
  revalidatePath(`/dress/${slug}`, "page");

  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/dress/${previousSlug}`, "page");
  }
}

export async function addDress(
  input: AddDressInput,
): Promise<ActionResult<ReturnType<typeof serializeDress>>> {
  try {
    const {
      title,
      slug,
      description,
      price,
      size,
      color,
      status,
      categoryId,
      imageUrl,
    } = input;

    if (!title?.trim()) return { success: false, error: "Title is required." };
    if (!slug?.trim()) return { success: false, error: "Slug is required." };
    if (!imageUrl?.trim())
      return { success: false, error: "Image is required." };

    const dress = await prisma.dress.create({
      data: {
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim(),
        price:
          price !== undefined && price !== null && price !== ""
            ? new Prisma.Decimal(price)
            : null,
        size: size.trim(),
        color: color.trim(),
        status: status ?? DressStatus.AVAILABLE,
        categoryId,
        images: {
          create: {
            url: imageUrl,
            isMain: true,
          },
        },
      },
      include: dressInclude,
    });
    revalidateDressPaths(dress.slug);

    return { success: true, data: serializeDress(dress) };
  } catch (error) {
    console.error("[addDress]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateDress(
  input: UpdateDressInput,
): Promise<ActionResult<ReturnType<typeof serializeDress>>> {
  try {
    const {
      id,
      title,
      slug,
      description,
      price,
      size,
      color,
      status,
      categoryId,
      imageUrl,
    } = input;

    if (!id?.trim()) return { success: false, error: "Dress ID is required." };
    if (!title?.trim()) return { success: false, error: "Title is required." };
    if (!slug?.trim()) return { success: false, error: "Slug is required." };
    if (!description?.trim())
      return { success: false, error: "Description is required." };
    if (!size?.trim()) return { success: false, error: "Size is required." };
    if (!color?.trim()) return { success: false, error: "Color is required." };
    if (!categoryId?.trim())
      return { success: false, error: "Category is required." };

    const existing = await prisma.dress.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!existing) {
      return { success: false, error: "Dress not found." };
    }

    await prisma.dress.update({
      where: { id },
      data: {
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim(),
        price:
          price !== undefined && price !== null && price !== ""
            ? new Prisma.Decimal(price)
            : null,
        size: size.trim(),
        color: color.trim(),
        status: status ?? DressStatus.AVAILABLE,
        categoryId,
      },
    });

    if (imageUrl?.trim()) {
      const mainImage =
        existing.images.find((image) => image.isMain) ?? existing.images[0];

      if (mainImage) {
        await prisma.image.update({
          where: { id: mainImage.id },
          data: { url: imageUrl.trim() },
        });
      } else {
        await prisma.image.create({
          data: {
            url: imageUrl.trim(),
            isMain: true,
            dressId: id,
          },
        });
      }
    }

    const updatedDress = await prisma.dress.findUniqueOrThrow({
      where: { id },
      include: dressInclude,
    });

    revalidateDressPaths(updatedDress.slug, existing.slug);

    return { success: true, data: serializeDress(updatedDress) };
  } catch (error) {
    console.error("[updateDress]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteDress(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    if (!id?.trim()) {
      return { success: false, error: "Dress ID is required." };
    }

    const existing = await prisma.dress.findUnique({
      where: { id },
      select: { slug: true },
    });

    if (!existing) {
      return { success: false, error: "Dress not found." };
    }

    await prisma.dress.delete({ where: { id } });

    revalidateDressPaths(existing.slug);

    return { success: true, data: { id } };
  } catch (error) {
    console.error("[deleteDress]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getAllDresses(filters?: {
  categoryId?: string;
}): Promise<ActionResult<ReturnType<typeof serializeDress>[]>> {
  try {
    const dresses = await prisma.dress.findMany({
      where: {
        // الفلتر السحري اللي Cursor مسحه
        ...(filters?.categoryId ? { categoryId: filters.categoryId } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: dressInclude,
    });

    return {
      success: true,
      data: dresses.map(serializeDress),
    };
  } catch (error) {
    console.error("[getAllDresses]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getDressBySlug(
  slug: string,
): Promise<ActionResult<ReturnType<typeof serializeDress>>> {
  try {
    if (!slug?.trim()) {
      return { success: false, error: "Slug is required." };
    }

    const dress = await prisma.dress.findUnique({
      where: { slug: slug.trim() },
      include: dressInclude,
    });

    if (!dress) {
      return { success: false, error: "Dress not found." };
    }

    return { success: true, data: serializeDress(dress) };
  } catch (error) {
    console.error("[getDressBySlug]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateDressStatus(
  id: string,
  status: DressStatus,
): Promise<ActionResult<ReturnType<typeof serializeDress>>> {
  try {
    if (!id?.trim()) {
      return { success: false, error: "Dress ID is required." };
    }

    if (!Object.values(DressStatus).includes(status)) {
      return { success: false, error: "Invalid dress status." };
    }

    const dress = await prisma.dress.update({
      where: { id },
      data: { status },
      include: dressInclude,
    });
    revalidateDressPaths(dress.slug);

    return { success: true, data: serializeDress(dress) };
  } catch (error) {
    console.error("[updateDressStatus]", error);
    return { success: false, error: getErrorMessage(error) };
  }
}
