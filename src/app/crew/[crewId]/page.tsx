import type { Metadata } from "next";
import { Suspense } from "react";
import { CrewView } from "@/components/crew/CrewView";
import { Skeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = { title: "Crew view · PITCREW" };

export default async function CrewPage({ params }: { params: Promise<{ crewId: string }> }) {
  const { crewId } = await params;
  return (
    <Suspense fallback={<Skeleton className="mx-auto mt-6 h-64 w-full max-w-[1200px]" />}>
      <CrewView crewId={decodeURIComponent(crewId)} />
    </Suspense>
  );
}
