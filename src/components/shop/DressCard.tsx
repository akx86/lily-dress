import Link from "next/link";
import Image from "next/image";
import { DressStatus } from "@prisma/client";
import type { SerializedDress } from "@/actions/dress.actions";

export function DressCard({ dress }: { dress: SerializedDress }) {
  const isRented = dress.status === DressStatus.RENTED;
  const imageUrl = dress.images?.[0]?.url || "/placeholder-dress.jpg";

  return (
    <Link
      href={`/dress/${dress.slug}`}
      className="group block focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-4 rounded-sm"
    >
      {/* حاوية الصورة مع حواف ناعمة للموبايل */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-100 rounded-lg">
        <Image
          src={imageUrl}
          alt={dress.title}
          fill
          // أوبتيمايزيشن للسرعة: تحميل دقة أقل على الموبايل لتسريع العرض
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
            isRented ? "grayscale opacity-80" : ""
          }`}
        />

        {/* بادج الإيجار: تصغير الحجم والمسافات للشاشات الصغيرة */}
        {isRented && (
          <div className="absolute top-3 right-3 bg-white/95 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-900 shadow-sm backdrop-blur-sm sm:top-4 sm:right-4 sm:px-4 sm:py-1.5 sm:text-[10px]">
            Rented
          </div>
        )}
      </div>

      {/* تفاصيل الفستان: أحجام متجاوبة وحماية من النصوص الطويلة */}
      <div className="mt-4 flex flex-col items-center text-center px-1 sm:mt-6">
        <h3 className="line-clamp-1 font-serif text-lg font-normal tracking-wide text-zinc-900 transition-colors group-hover:text-zinc-600 sm:text-xl">
          {dress.title}
        </h3>
        <p className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.15em] text-zinc-400 sm:mt-2 sm:text-xs">
          {dress.size} <span className="mx-2 opacity-50">•</span> {dress.color}
        </p>
      </div>
    </Link>
  );
}
