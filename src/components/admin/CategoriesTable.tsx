"use client";

import { useState, useEffect, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, PlusIcon, Trash2Icon, Edit2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { CategoryData } from "@/actions/category.actions";
import {
  addCategory,
  updateCategory,
  deleteCategory,
} from "@/actions/category.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  slug: z.string().trim().min(1, "Slug is required."),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

type CategoriesTableProps = {
  categories: CategoryData[];
};

// 1. فورم الإضافة (بتاعتك زي ما هي)
function AddCategoryForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", slug: "" },
  });

  const isSubmitting = form.formState.isSubmitting;
  const categoryName = form.watch("name");

  useEffect(() => {
    if (categoryName) {
      const generatedSlug = categoryName
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, "-");

      if (!form.getFieldState("slug").isDirty) {
        form.setValue("slug", generatedSlug, { shouldValidate: true });
      }
    }
  }, [categoryName, form]);

  async function onSubmit(values: CategoryFormValues) {
    const result = await addCategory(values);
    if (result.success) {
      toast.success("Category added successfully.");
      form.reset();
      router.refresh();
      onSuccess?.();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Evening Wear"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input
                  placeholder="evening-wear"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting && (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isSubmitting ? "Adding..." : "Add Category"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// 2. فورم التعديل (مبنية على الفورم بتاعتك)
function EditCategoryForm({
  category,
  onSuccess,
}: {
  category: CategoryData;
  onSuccess?: () => void;
}) {
  const router = useRouter();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: category.name, slug: category.slug },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: CategoryFormValues) {
    const result = await updateCategory({ id: category.id, ...values });
    if (result.success) {
      toast.success("Category updated successfully.");
      router.refresh();
      onSuccess?.();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input disabled={isSubmitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input disabled={isSubmitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting && (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// 3. الجدول الأساسي
export function CategoriesTable({ categories }: CategoriesTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // States للتحكم في المودالز
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(
    null,
  );

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;

    startTransition(async () => {
      const result = await deleteCategory(id);
      if (result.success) {
        toast.success("Category deleted successfully.");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">
          {categories.length}{" "}
          {categories.length === 1 ? "category" : "categories"}
        </p>

        {/* زرار ومودال الإضافة */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Category</DialogTitle>
              <DialogDescription>
                Create a new category for organizing dresses in the catalog.
              </DialogDescription>
            </DialogHeader>
            <AddCategoryForm onSuccess={() => setAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <Table className="min-w-[400px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={3}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No categories yet. Add your first category to get started.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="pl-4 font-medium whitespace-nowrap">
                      {category.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {category.slug}
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <div className="flex justify-end gap-2">
                        {/* زرار التعديل بيفتح المودال المنفصل */}
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isPending}
                          onClick={() => setEditingCategory(category)}
                          className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                        >
                          <Edit2Icon className="h-4 w-4" />
                        </Button>
                        {/* زرار الحذف */}
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isPending}
                          onClick={() => handleDelete(category.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-red-600"
                        >
                          {isPending ? (
                            <Loader2Icon className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2Icon className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* مودال التعديل: بره اللوب عشان ميكررش كود الـ Dialog لكل كاتيجوري */}
      <Dialog
        open={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the details of the selected category.
            </DialogDescription>
          </DialogHeader>
          {editingCategory && (
            <EditCategoryForm
              category={editingCategory}
              onSuccess={() => setEditingCategory(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
