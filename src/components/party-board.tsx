"use client";

import { deleteContribution } from "@/app/actions";
import { ContributionForm } from "@/components/contribution-form";
import { ResponsiveDialog } from "@/components/responsive-dialog";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CATEGORIES } from "@/lib/categories";
import { IconZoomExclamation } from "@tabler/icons-react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Enums, Tables } from "../../database.types";
import { Avatar } from "./ui/avatar";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "./ui/empty";
import { TabItem, Tabs, TabsList } from "./ui/tabs";

interface PartyBoardProps {
  contributions: Tables<"contributions">[];
  currentUserId: string;
  guestName: string;
}

type SortKey = "guest_name" | "item" | "category";
type SortDir = "asc" | "desc";
type Filter = "all" | Enums<"contribution_category">;

export function PartyBoard({
  contributions,
  currentUserId,
  guestName,
}: PartyBoardProps) {
  const [addOpen, setAddOpen] = useState(false);
  // Own rows open the filled form directly; deletion asks for confirmation.
  const [editing, setEditing] = useState<Tables<"contributions"> | null>(null);
  const [pendingDelete, setPendingDelete] =
    useState<Tables<"contributions"> | null>(null);
  const [isDeleting, startDelete] = useTransition();

  const [filter, setFilter] = useState<Filter>("all");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const closeAdd = useCallback(() => setAddOpen(false), []);
  const closeEdit = useCallback(() => setEditing(null), []);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    startDelete(async () => {
      const result = await deleteContribution(id);
      if (result.ok) {
        toast.success("C'est supprimé !");
      } else {
        toast.error(result.error);
      }
      setPendingDelete(null);
    });
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey(null);
    }
  };

  const rows = useMemo(() => {
    const filtered =
      filter === "all"
        ? contributions
        : contributions.filter((c) => c.category === filter);
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const cmp = a[sortKey].localeCompare(b[sortKey], "fr", {
        sensitivity: "base",
      });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [contributions, filter, sortKey, sortDir]);

  const counts = useMemo(
    () => ({
      all: contributions.length,
      food: contributions.filter((c) => c.category === "food").length,
      drink: contributions.filter((c) => c.category === "drink").length,
    }),
    [contributions],
  );

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: `Tout (${counts.all})` },
    {
      key: "food",
      label: `${CATEGORIES.food.emoji} ${CATEGORIES.food.label} (${counts.food})`,
    },
    {
      key: "drink",
      label: `${CATEGORIES.drink.emoji} ${CATEGORIES.drink.label} (${counts.drink})`,
    },
  ];

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (
      sortDir === "asc" ? (
        <ArrowUp size={13} className="inline-block" aria-hidden />
      ) : (
        <ArrowDown size={13} className="inline-block" aria-hidden />
      )
    ) : null;

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs defaultValue={filter}>
          <TabsList>
            {filters.map((filter) => (
              <TabItem
                key={filter.key}
                value={filter.key}
                label={filter.label}
                onClick={() => setFilter(filter.key)}
              />
            ))}
          </TabsList>
        </Tabs>
        <Button leadingIcon={Plus} onClick={() => setAddOpen(true)}>
          Ajouter
        </Button>
      </div>

      {rows.length > 0 ? (
        <Table className="md:text-[15px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%] p-0 md:w-[28%]">
                <SortButton onClick={() => toggleSort("guest_name")}>
                  Qui {sortIndicator("guest_name")}
                </SortButton>
              </TableHead>
              <TableHead className="p-0">
                <SortButton onClick={() => toggleSort("item")}>
                  Quoi {sortIndicator("item")}
                </SortButton>
              </TableHead>
              <TableHead className="w-[104px] p-0 md:w-[140px]">
                <SortButton onClick={() => toggleSort("category")}>
                  Type {sortIndicator("category")}
                </SortButton>
              </TableHead>
              <TableHead className="w-[64px] px-1 md:w-20 md:px-2">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((c, i) => {
              const category = c.category as Enums<"contribution_category">;
              const categoryData = CATEGORIES[category];
              const isMine = c.user_id === currentUserId;
              return (
                <TableRow
                  key={c.id}
                  index={i}
                  className={isMine ? "cursor-pointer" : undefined}
                  onClick={isMine ? () => setEditing(c) : undefined}
                >
                  <TableCell className="px-2 py-3 md:px-3 md:py-4 flex items-center gap-2">
                    <Avatar name={c.guest_name} />
                    {isMine ? "Moi" : c.guest_name}
                  </TableCell>
                  <TableCell className="px-2 py-3 md:px-3 md:py-4">
                    {c.item}
                  </TableCell>
                  <TableCell className="px-2 py-3 md:px-3 md:py-4">
                    <Badge
                      color={categoryData.color}
                      size="sm"
                      className="md:hidden"
                    >
                      {categoryData.emoji} {categoryData.label}
                    </Badge>
                    <Badge
                      color={categoryData.color}
                      size="md"
                      className="hidden md:inline-flex"
                    >
                      {categoryData.emoji} {categoryData.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-1 py-2 text-right md:px-2 md:py-3">
                    {isMine ? (
                      <span className="inline-flex items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Modifier"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditing(c);
                          }}
                        >
                          <Pencil aria-hidden />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Supprimer"
                          className="hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPendingDelete(c);
                          }}
                        >
                          <Trash2 aria-hidden />
                        </Button>
                      </span>
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <Empty className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-[13px] text-muted-foreground md:py-16 md:text-[15px]">
          <EmptyHeader className="max-w-md">
            <EmptyMedia variant="icon">
              <IconZoomExclamation />
            </EmptyMedia>
            <EmptyDescription>
              {contributions.length === 0
                ? "La liste est vide… sois le premier à ajouter ce que tu apportes ! 🎉"
                : "Rien dans cette catégorie pour l'instant."}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center gap-2">
            <Button leadingIcon={Plus} onClick={() => setAddOpen(true)}>
              Ajouter une contribution
            </Button>
          </EmptyContent>
        </Empty>
      )}

      <ResponsiveDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Qu'est-ce que tu apportes ?"
        description="Dis-nous ce que tu amènes à manger ou à boire."
      >
        <ContributionForm guestName={guestName} onSuccess={closeAdd} />
      </ResponsiveDialog>

      <ResponsiveDialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        title="Modifier ta ligne"
        description="Mets à jour ce que tu apportes."
      >
        {editing ? (
          <ContributionForm
            key={editing.id}
            contribution={editing}
            guestName={guestName}
            onSuccess={closeEdit}
          />
        ) : null}
      </ResponsiveDialog>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette ligne ?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `« ${pendingDelete.item} » sera retiré de la liste. Tu pourras toujours le rajouter plus tard.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                // Keep the dialog open while the action runs.
                e.preventDefault();
                confirmDelete();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Suppression…" : "Oui, supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SortButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-1 px-2 py-2 md:px-3 text-left text-foreground transition-colors hover:text-muted-foreground"
    >
      {children}
    </button>
  );
}
