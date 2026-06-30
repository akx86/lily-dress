"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { CategoryData } from "@/actions/category.actions";
import { addCategory } from "@/actions/category.actions";
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

const addCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  slug: z.string().trim().min(1, "Slug is required."),
});

type AddCategoryFormValues = z.infer<typeof addCategorySchema>;

type CategoriesTableProps = {
  categories: CategoryData[];
};

function AddCategoryForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();

  const form = useForm<AddCategoryFormValues>({
    resolver: zodResolver(addCategorySchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  // تريكة السينيور: مراقبة حقل الاسم وتوليد الـ Slug أوتوماتيك
  const categoryName = form.watch("name");

  useEffect(() => {
    if (categoryName) {
      const generatedSlug = categoryName
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, "-"); // استبدال المسافات والرموز بشرطة

      // التحديث يتم فقط لو الحقل مبدأش اليوزر يكتب فيه بإيده
      if (!form.getFieldState("slug").isDirty) {
        form.setValue("slug", generatedSlug, { shouldValidate: true });
      }
    }
  }, [categoryName, form]);

  async function onSubmit(values: AddCategoryFormValues) {
    const result = await addCategory(values);

    if (result.success) {
      toast.success("Category added successfully.");
      form.reset({ name: "", slug: "" });
      router.refresh();
      onSuccess?.();
      return;
    }

    toast.error(result.error);
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
                {/* الحقل متاح للتعديل اليدوي لو اليوزر حب يغيره */}
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

export function CategoriesTable({ categories }: CategoriesTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Mobile-First Layout: عمودي في الموبايل، أفقي في الشاشات الأكبر */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">
          {categories.length}{" "}
          {categories.length === 1 ? "category" : "categories"}
        </p>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
            <AddCategoryForm onSuccess={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* حماية الجدول بـ overflow-hidden و overflow-x-auto */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <Table className="min-w-[400px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Name</TableHead>
                <TableHead className="pr-4">Slug</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={2}
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
                    <TableCell className="pr-4 text-muted-foreground whitespace-nowrap">
                      {category.slug}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
