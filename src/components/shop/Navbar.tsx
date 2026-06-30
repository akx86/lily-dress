import Link from "next/link";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-3 items-center px-4 sm:px-8 md:px-16 lg:px-24">
        {/* الجزء الأيسر: الأقسام الفعلية */}
        <div className="flex justify-start">
          <Link
            href="/collections"
            className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:text-zinc-900 sm:text-xs"
          >
            Collections
          </Link>
        </div>

        {/* الجزء الأوسط: اللوجو المركزي */}
        <div className="flex justify-center">
          <Link
            href="/"
            className="font-serif text-xl tracking-widest text-zinc-900 transition-opacity hover:opacity-70 sm:text-2xl"
          >
            LILY
          </Link>
        </div>

        {/* الجزء الأيمن: فارغ هيكلياً */}
        {/* بنسيب الـ div ده عشان الـ grid يفضل محافظ على التماثل واللوجو يفضل في النص */}
        <div className="flex justify-end">
          {/* مستقبلاً ممكن نحط هنا أيقونة بحث (Search) لو حبيت ضفت الميزة دي */}
        </div>
      </div>
    </nav>
  );
}
