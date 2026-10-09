import type { ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { Skeleton } from "./Skeleton";
import { EmptyState, ErrorState } from "./States";

/** Loading skeleton -> error + retry -> empty state -> content. Stale data stays visible during refetch errors. */
export function QueryBoundary<T>({
  query,
  skeleton,
  isEmpty,
  empty,
  children,
}: {
  query: UseQueryResult<T, Error>;
  skeleton?: ReactNode;
  isEmpty?: (data: T) => boolean;
  empty?: ReactNode;
  children: (data: T) => ReactNode;
}) {
  if (query.data === undefined) {
    if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
    return <>{skeleton ?? <Skeleton className="h-40 w-full" />}</>;
  }
  if (isEmpty?.(query.data)) return <>{empty ?? <EmptyState title="Nothing here yet" />}</>;
  return <>{children(query.data)}</>;
}
