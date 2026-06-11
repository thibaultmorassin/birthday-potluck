"use client";

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
import { ArrowDown, ArrowUp, Pencil, Plus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Enums, Tables } from "../../database.types";
import { TabItem, Tabs, TabsList } from "./ui/tabs";

interface PartyBoardProps {
  contributions: Tables<"contributions">[];
}

type SortKey = "guest_name" | "item" | "category";
type SortDir = "asc" | "desc";
type Filter = "all" | Enums<"contribution_category">;

export function PartyBoard({ contributions }: PartyBoardProps) {
  const [addOpen, setAddOpen] = useState(false);
  // Two-step edit: AlertDialog confirmation first, then the form dialog.
  const [pendingEdit, setPendingEdit] =
    useState<Tables<"contributions"> | null>(null);
  const [editing, setEditing] = useState<Tables<"contributions"> | null>(null);

  const [filter, setFilter] = useState<Filter>("all");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const closeAdd = useCallback(() => setAddOpen(false), []);
  const closeEdit = useCallback(() => setEditing(null), []);

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
              <TableHead className="w-[110px] p-0 md:w-[140px]">
                <SortButton onClick={() => toggleSort("category")}>
                  Type {sortIndicator("category")}
                </SortButton>
              </TableHead>
              <TableHead className="w-8 md:w-10">
                <span className="sr-only">Modifier</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((c, i) => {
              const category = c.category as Enums<"contribution_category">;
              const categoryData = CATEGORIES[category];
              return (
                <TableRow
                  key={c.id}
                  index={i}
                  className="cursor-pointer"
                  onClick={() => setPendingEdit(c)}
                >
                  <TableCell className="py-3 md:py-4">{c.guest_name}</TableCell>
                  <TableCell className="py-3 md:py-4">{c.item}</TableCell>
                  <TableCell className="py-3 md:py-4">
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
                  <TableCell className="py-3 text-right md:py-4">
                    <Pencil
                      size={14}
                      className="inline-block text-muted-foreground"
                      aria-hidden
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-[13px] text-muted-foreground md:py-16 md:text-[15px]">
          {contributions.length === 0
            ? "La liste est vide… sois le premier à ajouter ce que tu apportes ! 🎉"
            : "Rien dans cette catégorie pour l'instant."}
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
      className="flex w-full cursor-pointer items-center gap-1 px-3 py-2 text-left text-foreground transition-colors hover:text-muted-foreground"
    >
      {children}
    </button>
  );
}
