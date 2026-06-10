"use client";

import { useCallback, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ContributionForm,
  type ContributionDraft,
} from "@/components/contribution-form";
import { ResponsiveDialog } from "@/components/responsive-dialog";

interface PartyBoardProps {
  contributions: ContributionDraft[];
}

export function PartyBoard({ contributions }: PartyBoardProps) {
  const [addOpen, setAddOpen] = useState(false);
  // Two-step edit: AlertDialog confirmation first, then the form dialog.
  const [pendingEdit, setPendingEdit] = useState<ContributionDraft | null>(
    null,
  );
  const [editing, setEditing] = useState<ContributionDraft | null>(null);

  const closeAdd = useCallback(() => setAddOpen(false), []);
  const closeEdit = useCallback(() => setEditing(null), []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] text-muted-foreground">
          {contributions.length === 0
            ? "Personne ne s'est encore inscrit."
            : `${contributions.length} ${
                contributions.length > 1
                  ? "personnes apportent"
                  : "personne apporte"
              } quelque chose.`}
        </p>
        <Button leadingIcon={Plus} onClick={() => setAddOpen(true)}>
          Ajouter
        </Button>
      </div>

      {contributions.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[38%]">Qui</TableHead>
              <TableHead>Quoi</TableHead>
              <TableHead className="w-10">
                <span className="sr-only">Modifier</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contributions.map((c, i) => (
              <TableRow
                key={c.id}
                index={i}
                className="cursor-pointer"
                onClick={() => setPendingEdit(c)}
              >
                <TableCell className="py-3">{c.guest_name}</TableCell>
                <TableCell className="py-3">{c.item}</TableCell>
                <TableCell className="py-3 text-right">
                  <Pencil
                    size={14}
                    className="inline-block text-muted-foreground"
                    aria-hidden
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-[13px] text-muted-foreground">
          La liste est vide… sois le premier à ajouter ce que tu apportes ! 🎉
        </div>
      )}

      <ResponsiveDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Qu'est-ce que tu apportes ?"
        description="Dis-nous qui tu es et ce que tu amènes à manger ou à boire."
      >
        <ContributionForm onSuccess={closeAdd} />
      </ResponsiveDialog>

      <AlertDialog
        open={pendingEdit !== null}
        onOpenChange={(open) => {
          if (!open) setPendingEdit(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Modifier cette ligne ?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingEdit
                ? `« ${pendingEdit.guest_name} apporte ${pendingEdit.item} » — tu es sûr de vouloir la modifier ?`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setEditing(pendingEdit);
                setPendingEdit(null);
              }}
            >
              Oui, modifier
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ResponsiveDialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        title="Modifier la ligne"
        description="Mets à jour qui tu es ou ce que tu apportes."
      >
        {editing ? (
          <ContributionForm
            key={editing.id}
            contribution={editing}
            onSuccess={closeEdit}
          />
        ) : null}
      </ResponsiveDialog>
    </div>
  );
}
