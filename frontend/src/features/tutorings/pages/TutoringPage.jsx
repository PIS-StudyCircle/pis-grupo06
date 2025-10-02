import { useState, useEffect, useMemo } from "react";
import { useTutorings } from "../hooks/useTutorings";
import TutoringList from "../components/TutoringList";
import TutoringSearchBar from "../components/TutoringSearchBar";
import Pagination from "@components/Pagination";

export default function TutoringPage({ filters = {}, mode = "" }) {
  const [searchBy, setSearchBy] = useState("course");
  const [showWithoutTutor, setShowWithoutTutor] = useState(false);

  // combine filters (search + showWithoutTutor)
  const mergedFilters = useMemo(() => {
    const baseFilters = { ...filters };

    // add toggle
    if (showWithoutTutor) {
      baseFilters.no_tutor = true;
    }

    // add searchBy param (we set search separately)
    baseFilters.search_by = searchBy;

    return baseFilters;
  }, [filters, searchBy, showWithoutTutor]);

  const {
    tutorings,
    loading,
    error,
    pagination,
    page,
    setPage,
    search,
    setSearch,
  } = useTutorings(1, 20, mergedFilters);

  const totalPages = pagination?.last || 1;

  // controlled input for search bar
  const [query, setQuery] = useState(search);

  // keep local query in sync with hook’s search
  useEffect(() => {
    setQuery(search);
  }, [search]);

  // debounce search updates
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(query);
      if (page !== 1) setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [query, page, setSearch, setPage]);

  // reset page when searchBy changes
  useEffect(() => {
    if (page !== 1) setPage(1);
  }, [searchBy, page, setPage]);

  return (
    <div className="flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-4 content-scroll">
        <div className="max-w-5xl mx-auto">
          <div className="mb-4 p-2">
            <h1 className="text-2xl font-bold p-2 mb-4 text-black">
              Tutorías Disponibles
            </h1>

            {/* Search bar */}
            <TutoringSearchBar
              query={query}
              onQueryChange={(e) => setQuery(e.target.value)}
              searchBy={searchBy}
              onSearchByChange={setSearchBy}
              placeholder={
                searchBy === "course"
                  ? "Buscar por materia..."
                  : "Buscar por tema..."
              }
            />

            {/* Filter toggle */}
            <label className="flex items-center gap-2 cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={showWithoutTutor}
                onChange={(e) => setShowWithoutTutor(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Tutor Indefinido</span>
            </label>
          </div>

          <TutoringList tutorings={tutorings} mode={mode} loading={loading} error={error} />

          <Pagination page={page} setPage={setPage} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
