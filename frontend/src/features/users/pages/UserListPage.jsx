import { useEffect, useState } from "react";
import UserList from "../components/UserList";
import { useUsers } from "../hooks/useUsers";
import SearchInput from "@components/SearchInput";
import Pagination from "@components/Pagination";
import PageTitle from "@components/PageTitle";

export default function UserListPage() {
  const {
    users,
    loading,
    error,
    pagination,
    page,
    setPage,
    search,
    setSearch,
    setRole,
  } = useUsers(1, 20); // sin filtro inicial

  const totalPages = pagination.last || 1;
  const [query, setQuery] = useState(search);
  const [showOnlyTutors, setShowOnlyTutors] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(query);
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [query, setPage, setSearch]);

  useEffect(() => {
    setRole(showOnlyTutors ? "tutor" : "");
  }, [showOnlyTutors, setRole]);

  return (
    <div className="flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-4 content-scroll">
        <div className="max-w-5xl mx-auto">
          <PageTitle title="Usuarios" className="titulo" />

          <SearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar usuario..."
          />

          {/* Checkbox para filtrar solo tutores */}
          <label className="flex items-center gap-2 cursor-pointer ml-2 mb-4">
            <input
              type="checkbox"
              checked={showOnlyTutors}
              onChange={(e) => {
                setShowOnlyTutors(e.target.checked);
                setPage(1);
              }}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">Solo tutores</span>
          </label>

          <UserList
            users={users}
            loading={loading}
            error={error}
            msj={
              showOnlyTutors
                ? "No hay tutores disponibles."
                : "No hay usuarios disponibles."
            }
          />

          <Pagination page={page} setPage={setPage} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
