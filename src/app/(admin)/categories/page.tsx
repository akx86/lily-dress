import { getAllCategories } from "@/actions/category.actions";
import { CategoriesTable } from "@/components/admin/CategoriesTable";

export default async function AdminCategoriesPage() {
  const result = await getAllCategories();

  if (!result.success) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <header className="mb-10">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Categories
            </h1>
          </header>
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-4 text-sm text-destructive">
            Failed to load categories: {result.error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-10">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Categories
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Organize your catalog into categories before adding dresses.
          </p>
        </header>

        <CategoriesTable categories={result.data} />
      </div>
    </div>
  );
}
