import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const metadata: Metadata = { title: "Operations dashboard · PITCREW" };

export default function DashboardPage() {
  return <DashboardView />;
}
