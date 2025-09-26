import { useTutorings } from "../hooks/useTutorings";
import TutoringList from "../components/TutoringList";    
import Pagination from "@components/Pagination";


export default function TutoringPage({filters = {}, mode = ""}) {
  const { tutorings, loading, error, pagination, page, setPage } = useTutorings(1, 20, filters);
  const totalPages = pagination.last || 1;


  return (
    <div className="flex flex-col ">
      <div className="flex-1 overflow-y-auto px-6 py-4 content-scroll">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold p-2 mb-4 text-black">
            Tutorías Disponibles
          </h1>

          <TutoringList tutorings={tutorings} mode = {mode} loading={loading} error={error} />

          <Pagination page={page} setPage={setPage} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
