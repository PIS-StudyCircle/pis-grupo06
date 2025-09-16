import { useState, useEffect } from "react";
import NavBar from "@components/NavBar";
import Footer from "@components/Footer";
import { useTutorings } from "../hooks/useTutorings";
import TutoringList from "../components/TutoringList";    
import Pagination from "@components/Pagination";

export default function TutoringPage({filters = {}}) {
  const { tutorings, loading, error, pagination, page, setPage, search, setSearch } = useTutorings({filters});
  const totalPages = pagination.last || 1;

  const [query, setQuery] = useState(search);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(query);
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [query, setPage, setSearch]);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-shrink-0">
        <NavBar />
      </div>

      <div className="flex flex-1 overflow-hidden bg-[#f3f8f9]">
        <div className="w-1/4 bg-white rounded-lg shadow-md m-4"></div>

        <div className="flex-1 overflow-y-auto px-6 py-4 content-scroll">
          <h1 className="text-2xl font-bold p-2 mb-4 text-black">Tutorias Disponibles</h1>

          <TutoringList tutorings={tutorings} loading={loading} error={error} />

          <Pagination page={page} setPage={setPage} totalPages={totalPages} />
        </div>

        <div className="w-1/4 bg-white rounded-lg shadow-md m-4"></div>
      </div>
      <Footer />
    </div>
  );
}
