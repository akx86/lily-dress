import { DressStatus } from "@prisma/client";

import { getAllDresses } from "@/actions/dress.actions";
import { getSettings } from "@/actions/settings.actions";
import { DressCard } from "@/components/shop/DressCard";

type ShopPageProps = {
  searchParams: Promise<{ categoryId?: string }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  // فك الـ Promise بتاع الـ searchParams عشان نقرأ الـ categoryId
  const resolvedSearchParams = await searchParams;
  const categoryId = resolvedSearchParams.categoryId;

  // جلب الفساتين (مع تمرير الفلتر) والإعدادات بالتوازي
  const [dressesResult, settingsResult] = await Promise.all([
    getAllDresses({ categoryId }),
    getSettings(),
  ]);

  if (!dressesResult.success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 py-24 sm:px-8">
        <p className="max-w-md text-center text-sm text-zinc-500">
          Unable to load the collection. Please try again later.
        </p>
      </div>
    );
  }

  const dresses = dressesResult.data.filter(
    (dress) => dress.status !== DressStatus.MAINTENANCE,
  );

  const heroMessage =
    settingsResult.success && settingsResult.data.heroMessage
      ? settingsResult.data.heroMessage
      : "Curated pieces for your most memorable occasions. Each dress is hand-selected for elegance, quality, and timeless style.";

  return (
    <div className="min-h-screen bg-white">
      <header className="px-4 py-12 sm:px-8 sm:py-20 md:px-16 md:py-28 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-400 sm:text-xs">
            Rental Collection
          </p>
          <h1 className="mt-4 font-serif text-3xl font-normal tracking-wide text-zinc-900 sm:mt-6 sm:text-4xl md:text-5xl lg:text-6xl">
            Lily Dress 🎀
          </h1>
          <p className="mt-4 max-w-lg text-xs leading-relaxed text-zinc-500 sm:mt-6 sm:text-sm">
            {heroMessage}
          </p>
        </div>
      </header>

      <main className="px-4 pb-24 sm:px-8 sm:pb-32 md:px-16 lg:px-24">
        <div className="mx-auto max-w-7xl">
          {dresses.length === 0 ? (
            <p className="py-16 text-center text-xs text-zinc-500 sm:py-24 sm:text-sm">
              Our collection is being curated. Please check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-12 md:grid-cols-3 lg:grid-cols-4 xl:gap-x-8 xl:gap-y-16">
              {dresses.map((dress) => (
                <DressCard key={dress.id} dress={dress} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
