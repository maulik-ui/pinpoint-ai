import { Suspense } from "react";
import SearchResultsPage from "@/src/components/SearchResultsPage";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q || "";

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResultsPage query={query} />
    </Suspense>
  );
}

