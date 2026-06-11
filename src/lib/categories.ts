import type { BadgeProps } from "@/components/ui/badge";
import { Enums } from "../../database.types";

export const CATEGORIES: Record<
  Enums<"contribution_category">,
  { label: string; emoji: string; color: NonNullable<BadgeProps["color"]> }
> = {
  food: { label: "À manger", emoji: "🍰", color: "amber" },
  drink: { label: "À boire", emoji: "🍹", color: "blue" },
};
