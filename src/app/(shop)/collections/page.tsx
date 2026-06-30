import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collections | Lily Dress",
  description: "Explore our curated dress collections by category.",
};

export default async function CollectionsPage() {
  // جلب الأقسام من الداتا بيز مع عدد الفساتين في كل قسم (Senior Optimization)
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { dresses: true }, // بنفترض إن اسم العلاقة في Prisma هو dresses
      },
    },
  });

  return (
    <div className="min-h-screen bg-white">
      <header className="px-4 py-16 sm:px-8 sm:py-24 md:px-16 lg:px-24">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-400 sm:text-xs">
            Our Categories
          </p>
          <h1 className="mt-4 font-serif text-3xl font-normal tracking-wide text-zinc-900 sm:mt-6 sm:text-4xl md:text-5xl">
            Collections
          </h1>
        </div>
      </header>

      <main className="px-4 pb-24 sm:px-8 sm:pb-32 md:px-16 lg:px-24">
        <div className="mx-auto max-w-3xl">
          {categories.length === 0 ? (
            <p className="text-center text-sm text-zinc-500">
              Our collections are currently being updated.
            </p>
          ) : (
            <div className="flex flex-col space-y-4 sm:space-y-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  // هنبعت الـ ID في الرابط عشان نقدر نفلتر بيه في الصفحة الرئيسية
                  href={`/?categoryId=${category.id}`}
                  className="group flex items-center justify-between border-b border-zinc-100 pb-4 transition-colors hover:border-zinc-300 sm:pb-6"
                >
                  <span className="font-serif text-xl tracking-wide text-zinc-900 transition-colors group-hover:text-zinc-600 sm:text-2xl">
                    {category.name}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 transition-colors group-hover:text-zinc-900 sm:text-xs">
                    {category._count.dresses} Pieces
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
