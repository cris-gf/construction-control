import {
  ChartNoAxesCombined,
  ClipboardList,
  HardHat,
  LayoutDashboard,
  Settings,
  ShoppingBag,
} from "lucide-react";
import { navigationText } from "../locales/es/navigation";
import { routes } from "./routes";

export const nav = [
  [routes.dashboard, navigationText.dashboard, LayoutDashboard],
  [routes.purchases, navigationText.purchases, ShoppingBag],
  [routes.pending, navigationText.pending, ClipboardList],
  [routes.team, navigationText.team, HardHat],
  [routes.prices, navigationText.prices, ChartNoAxesCombined],
  [routes.backup, navigationText.backup, Settings],
] as const;
