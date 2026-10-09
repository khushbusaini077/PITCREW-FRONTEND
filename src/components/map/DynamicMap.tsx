"use client";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/Skeleton";

const mapSkeleton = () => <Skeleton className="h-full min-h-[280px] w-full" />;

/** Leaflet touches window on import, so it is loaded client-side only (Constitution 10.5). */
export const MapView = dynamic(() => import("./MapView"), { ssr: false, loading: mapSkeleton });
export const LocationPicker = dynamic(() => import("./LocationPicker"), { ssr: false, loading: mapSkeleton });
