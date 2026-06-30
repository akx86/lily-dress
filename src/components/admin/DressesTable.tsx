"use client";

import { useState } from "react";
import { DressStatus } from "@prisma/client";
import { Loader2Icon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { SerializedDress } from "@/actions/dress.actions";
import { deleteDress } from "@/actions/dress.actions";
import { AddDressForm } from "@/components/admin/AddDressForm";
import { EditDressForm } from "@/components/admin/EditDressForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CategoryOption = {
  id: string;
  name: string;
};

type DressesTableProps = {
  dresses: SerializedDress[];
  categories: CategoryOption[];
};

const statusConfig: Record<DressStatus, { label: string; className: string }> =
  {
    AVAILABLE: {
      label: "Available",
      className: "border-green-200 bg-green-50 text-green-700",
    },
    RENTED: {
      label: "Rented",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    },
    MAINTENANCE: {
      label: "Maintenance",
      className: "border-zinc-200 bg-zinc-100 text-zinc-600",
    },
  };

function StatusBadge({ status }: { status: DressStatus }) {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

function DeleteDressDialog({
  dress,
  onSuccess,
}: {
  dress: SerializedDress;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);

    const result = await deleteDress(dress.id);

    if (result.success) {
      toast.success("Dress deleted successfully.");
      setOpen(false);
      router.refresh();
      onSuccess?.();
    } else {
      toast.error(result.error);
    }

    setIsDeleting(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="text-zinc-500">
          <Trash2Icon className="h-4 w-4" />
          <span className="sr-only">Delete {dress.title}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Dress</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &ldquo;{dress.title}&rdquo;? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            disabled={isDeleting}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="w-full sm:w-auto"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting && (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isDeleting ? "Deleting..." : "Delete Dress"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DressesTable({ dresses, categories }: DressesTableProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingDress, setEditingDress] = useState<SerializedDress | null>(
    null,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-sm text-zinc-500">
          {dresses.length} {dresses.length === 1 ? "dress" : "dresses"}
        </p>

        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add New Dress
            </Button>
          </DialogTrigger>
          <DialogContent
            className="sm:max-w-lg"
            onInteractOutside={(e) => {
              const target = e.target as HTMLElement;
              if (
                target.closest('[role="listbox"]') ||
                target.closest("[data-radix-select-content]")
              ) {
                e.preventDefault();
              }
            }}
          >
            <DialogHeader>
              <DialogTitle>Add New Dress</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new dress to the catalog.
              </DialogDescription>
            </DialogHeader>
            <AddDressForm
              categories={categories}
              onSuccess={() => setAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Title</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dresses.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-zinc-500"
                  >
                    No dresses yet. Add your first dress to get started.
                  </TableCell>
                </TableRow>
              ) : (
                dresses.map((dress) => (
                  <TableRow key={dress.id}>
                    <TableCell className="pl-4 font-medium whitespace-nowrap">
                      {dress.title}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {dress.size}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {dress.color}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <StatusBadge status={dress.status} />
                    </TableCell>
                    <TableCell className="pr-4 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-zinc-500"
                          onClick={() => setEditingDress(dress)}
                        >
                          <PencilIcon className="h-4 w-4" />
                          <span className="sr-only">Edit {dress.title}</span>
                        </Button>
                        <DeleteDressDialog dress={dress} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog
        open={editingDress !== null}
        onOpenChange={(open) => {
          if (!open) setEditingDress(null);
        }}
      >
        <DialogContent
          className="sm:max-w-lg"
          onInteractOutside={(e) => {
            const target = e.target as HTMLElement;
            if (
              target.closest('[role="listbox"]') ||
              target.closest("[data-radix-select-content]")
            ) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Edit Dress</DialogTitle>
            <DialogDescription>
              Update the dress details below. Leave the image unchanged or
              upload a new one.
            </DialogDescription>
          </DialogHeader>
          {editingDress && (
            <EditDressForm
              key={editingDress.id}
              dress={editingDress}
              categories={categories}
              onSuccess={() => setEditingDress(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
