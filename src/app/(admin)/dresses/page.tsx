import { getAllCategories } from "@/actions/category.actions";
import { getAllDresses } from "@/actions/dress.actions";
import { DressesTable } from "@/components/admin/DressesTable";

export default async function AdminDressesPage() {
  // جلب البيانات بالتوازي لضمان أقصى سرعة
  const [result, categoriesResult] = await Promise.all([
    getAllDresses(),
    getAllCategories(),
  ]);

  // Graceful Fallback: لو الأقسام فشلت، نرجع مصفوفة فاضية بدل ما نكسر الصفحة كلها
  const categories = categoriesResult.success ? categoriesResult.data : [];

  return (
    // توحيد الخلفية مع باقي صفحات لوحة التحكم
    <div className="min-h-screen bg-zinc-50/50">
      {/* توحيد المسافات لتدعم الموبايل والديسكتوب */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* هيدر واحد نظيف وموحد */}
        <header className="mb-8 sm:mb-10">
          <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500 sm:text-xs">
            Admin
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 sm:mt-2 sm:text-3xl">
            Dresses
          </h1>
          <p className="mt-2 max-w-xl text-xs text-zinc-500 sm:text-sm">
            Manage your rental catalog — view inventory and add new pieces.
          </p>
        </header>

        {/* عرض الجدول أو رسالة الخطأ بناءً على حالة النتيجة */}
        {!result.success ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600 sm:px-6">
            Failed to load dresses: {result.error}
          </div>
        ) : (
          <DressesTable dresses={result.data} categories={categories} />
        )}
      </div>
    </div>
  );
}
