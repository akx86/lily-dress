import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { DressStatus } from "@prisma/client";
import { notFound } from "next/navigation";

import { getDressBySlug } from "@/actions/dress.actions";
import { getSettings } from "@/actions/settings.actions";
import { WhatsAppButton } from "@/components/shop/WhatsAppButton";
import { cn } from "@/lib/utils";

type DressPageProps = {
  params: Promise<{ slug: string }>;
};

function getMainImageUrl(
  images: { url: string; isMain: boolean }[],
): string | null {
  const mainImage = images.find((image) => image.isMain);
  return mainImage?.url ?? images[0]?.url ?? null;
}

const statusLabels: Record<DressStatus, string> = {
  AVAILABLE: "Available",
  RENTED: "Rented",
  MAINTENANCE: "Maintenance",
};

// السينيور تاتش: توليد الميتا داتا ديناميكياً عشان الـ Share على السوشيال ميديا والواتساب
export async function generateMetadata({
  params,
}: DressPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getDressBySlug(slug);

  if (!result.success) {
    return { title: "Dress Not Found | Lily Dress" };
  }

  const dress = result.data;
  const imageUrl = getMainImageUrl(dress.images);

  return {
    title: `${dress.title} | Lily Dress`,
    description: dress.description,
    openGraph: {
      title: dress.title,
      description: dress.description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function DressPage({ params }: DressPageProps) {
  const { slug } = await params;

  const [result, settingsResult] = await Promise.all([
    getDressBySlug(slug),
    getSettings(),
  ]);

  if (!result.success) {
    notFound();
  }

  const dress = result.data;
  const whatsappNumber = settingsResult.success
    ? settingsResult.data.whatsappNumber
    : null;
  const imageUrl = getMainImageUrl(dress.images);
  const isRented = dress.status === DressStatus.RENTED;

  return (
    <div className="min-h-screen bg-white">
      <div className="grid md:grid-cols-2">
        {/* حاوية الصورة مع Sticky للديسكتوب */}
        <div className="relative bg-zinc-100 md:sticky md:top-0 md:h-screen">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={dress.title}
              width={1200}
              height={1600}
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className={cn(
                "aspect-[3/4] h-full w-full object-cover md:aspect-auto md:h-screen",
                isRented && "grayscale",
              )}
            />
          ) : (
            <div
              className={cn(
                "flex aspect-[3/4] w-full items-center justify-center bg-zinc-100 md:aspect-auto md:h-screen",
                isRented && "grayscale",
              )}
            >
              <span className="text-xs uppercase tracking-[0.25em] text-zinc-400">
                No image
              </span>
            </div>
          )}

          {isRented && (
            <div className="absolute inset-0 flex items-center justify-center md:hidden">
              <span className="border border-zinc-900/15 bg-white/95 px-6 py-2.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-900 shadow-sm backdrop-blur-sm sm:px-8 sm:py-3 sm:text-[11px]">
                Rented
              </span>
            </div>
          )}
        </div>

        {/* حاوية التفاصيل - Mobile First Padding (px-4 py-10) */}
        <div className="flex flex-col justify-center px-4 py-10 sm:px-8 sm:py-16 md:px-16 md:py-24 lg:px-24">
          <div className="mx-auto w-full max-w-md space-y-10 sm:space-y-12">
            <div className="space-y-6 sm:space-y-8">
              <Link
                href="/"
                className="inline-block text-[10px] uppercase tracking-[0.25em] text-zinc-400 transition-colors hover:text-zinc-900 sm:text-xs"
              >
                ← Collection
              </Link>

              <div className="space-y-4 sm:space-y-6">
                <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 sm:text-xs">
                  {dress.category.name}
                </p>

                <h1 className="font-serif text-3xl font-normal leading-tight tracking-wide text-zinc-900 sm:text-4xl md:text-5xl">
                  {dress.title}
                </h1>

                {isRented && (
                  <p className="text-[10px] uppercase tracking-[0.25em] text-red-800/70 sm:text-xs">
                    Currently rented
                  </p>
                )}
              </div>

              {dress.price && (
                <p className="text-base tracking-wide text-zinc-900 sm:text-lg">
                  {dress.price} EGP
                </p>
              )}

              <p className="text-xs leading-relaxed text-zinc-500 sm:text-sm">
                {dress.description}
              </p>

              <dl className="grid grid-cols-2 gap-6 border-t border-zinc-100 pt-6 sm:gap-8 sm:pt-8">
                <div className="space-y-1.5 sm:space-y-2">
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 sm:text-xs">
                    Size
                  </dt>
                  <dd className="text-xs font-medium text-zinc-900 sm:text-sm">
                    {dress.size}
                  </dd>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 sm:text-xs">
                    Color
                  </dt>
                  <dd className="text-xs font-medium text-zinc-900 sm:text-sm">
                    {dress.color}
                  </dd>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 sm:text-xs">
                    Status
                  </dt>
                  <dd className="text-xs font-medium text-zinc-900 sm:text-sm">
                    {statusLabels[dress.status]}
                  </dd>
                </div>
              </dl>
            </div>

            {/* تم إزالة الخصائص الزائدة بناءً على الأوبتيمايزيشن الأخير */}
            <WhatsAppButton
              dressTitle={dress.title}
              whatsappNumber={whatsappNumber}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
