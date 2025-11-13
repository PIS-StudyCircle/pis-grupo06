import { useEffect, useRef, useState } from "react";
import { useUser } from "@context/UserContext";
import { getTopRatedTutors, getMonthlyRanking } from "@/features/users/services/feedbackServices";
import TutorCard from "./TutorCard";
import TutorSkeleton from "./TutorSkeleton";
import Pagination from "@components/Pagination";

function MonthlyPager({ items = [] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(items.length, 1);

  if (!items.length) {
    return (
      <li className="py-6 text-center text-gray-500">
        No hay rankings históricos disponibles.
      </li>
    );
  }

  const month = items[page - 1];

  return (
    <li className="py-3">
      <div className="flex flex-col items-center">
        {/* Encabezado del mes */}
        <div className="text-sm text-gray-700 font-medium mb-3 select-none">
          {month.month_name}
        </div>

        {/* Lista de tutores del mes */}
        <div className="w-full space-y-2 mb-4">
          {month.top_tutors.slice(0, 3).map((t) => (
            <TutorCard
              key={t.tutor.id}
              tutor={{
                id: t.tutor.id,
                name: t.tutor.name,
                last_name: t.tutor.last_name,
                average_rating: t.average_rating,
                total_feedbacks: t.total_feedbacks,
              }}
              index={t.rank - 1}
            />
          ))}
        </div>

        <Pagination page={page} setPage={setPage} totalPages={totalPages} />
      </div>
    </li>
  );
}

export default function TopTutors() {
  const [activeTab, setActiveTab] = useState("current");
  const [tutors, setTutors] = useState([]);
  const [monthlyRankings, setMonthlyRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const { user } = useUser();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const fetchData = async () => {
      const hasCache =
        (activeTab === "current" && tutors.length > 0) ||
        (activeTab === "monthly" && monthlyRankings.length > 0);

      if (!hasCache) setLoading(true);
      setError(null);

      try {
        if (activeTab === "current") {
          const data = await getTopRatedTutors({ signal: controller.signal });
          setTutors(Array.isArray(data) ? data : []);
        } else {
          const data = await getMonthlyRanking();
          const rankings = Array.isArray(data) ? data : (data?.monthly_rankings || []);
          setMonthlyRankings(Array.isArray(rankings) ? rankings : []);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err?.message ?? "Ocurrió un error inesperado");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [user, activeTab]);

  if (!user) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 mt-8 w-full max-w-md text-center">
        <h2 className="text-lg font-semibold mb-3">🏆 Tutores Destacados</h2>
        <p className="text-gray-700">Iniciá sesión para conocer a los tutores destacados.</p>
      </div>
    );
  }

  const onRetry = () => {
    setError(null);  //  Limpia el error
    if (activeTab === "current") {
      setTutors([]);  //  Limpia cache para forzar nueva petición
    } else {
      setMonthlyRankings([]);  //  Limpia cache para forzar nueva petición
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mt-8 w-full max-w-md">
      <h2 className="text-lg font-semibold mb-3 text-center text-black">🏆 Tutores Destacados</h2>

      <div className="flex mb-4 bg-gray-100 rounded-lg p-1" role="tablist" aria-label="Ranking de tutores">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "current"}
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
            activeTab === "current" ? "bg-white text-blue-600 shadow-sm" : "text-gray-700 hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("current")}
        >
          Top del mes
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "monthly"}
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
            activeTab === "monthly" ? "bg-white text-blue-600 shadow-sm" : "text-gray-700 hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("monthly")}
        >
          Histórico
        </button>
      </div>

      <ul className="divide-y divide-gray-200">
        {loading && Array.from({ length: 5 }).map((_, i) => <TutorSkeleton key={`sk-${i}`} />)}

        {/* Error */}
        {!loading && error && (
          <li className="py-6 text-center">
            <p className="text-red-600 mb-2">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Reintentar
            </button>
          </li>
        )}

        {/* Tab: Mes actual */}
        {!loading && !error && activeTab === "current" && (
          <>
            {tutors.length === 0 ? (
              <li className="py-6 text-center text-gray-500">Todavía no hay tutores puntuados este mes.</li>
            ) : (
              tutors.map((tutor, index) => (
                <li key={tutor.id} className="py-3">
                  <TutorCard tutor={tutor} index={index} />
                </li>
              ))
            )}
          </>
        )}

        {/* Tab: Histórico */}
        {!loading && !error && activeTab === "monthly" && (
          <MonthlyPager items={monthlyRankings} />
        )}
      </ul>
    </div>
  );
}
