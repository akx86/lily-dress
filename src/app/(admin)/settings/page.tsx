import { getSettings } from "@/actions/settings.actions";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const result = await getSettings();

  return (
    // توحيد الخلفية مع باقي صفحات الأدمن
    <div className="min-h-screen bg-zinc-50/50">
      {/* max-w-2xl مناسبة جداً لصفحة الإعدادات عشان الفورم متبقاش ممطوطة، مع مسافات الموبايل */}
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* هيدر موحد و Responsive */}
        <header className="mb-8 sm:mb-10">
          <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500 sm:text-xs">
            Admin
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 sm:mt-2 sm:text-3xl">
            Store Settings
          </h1>
          <p className="mt-2 max-w-xl text-xs text-zinc-500 sm:text-sm">
            Manage your WhatsApp contact, social links, and storefront
            messaging.
          </p>
        </header>

        {/* عرض رسالة الخطأ أو الفورم مباشرة بدون حاويات زائدة */}
        {!result.success ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600 sm:px-6">
            Failed to load settings: {result.error}
          </div>
        ) : (
          <SettingsForm settings={result.data} />
        )}
      </div>
    </div>
  );
}
