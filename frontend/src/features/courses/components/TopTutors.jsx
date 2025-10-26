import { useEffect, useState } from "react";
import { getTopRatedTutors } from "@/features/users/services/feedbackServices";

export default function TopTutors() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

   useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTopRatedTutors();
        setTutors(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  if (loading) return <div className="text-gray-500">Cargando ranking...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mt-8 w-full max-w-md">
      <h2 className="text-lg font-semibold mb-3 text-center text-blue-700">
        🏆 Mejores Tutores
      </h2>
        <ul className="divide-y divide-gray-200">
          {tutors.length === 0 ? (
            <li className="py-6 text-center text-gray-500">
              Todavía no hay tutores puntuados.
            </li>
          ) : (
            tutors.map((tutor, index) => (
              <li key={tutor.id} className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">
                      {index + 1}. {tutor.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({tutor.email})
                    </span>
                  </div>

                  {/* Estrellas y puntuación */}
                  <div className="flex items-center text-yellow-500 font-semibold text-base">
                    <span className="mr-1 text-lg">⭐</span>
                    <span>{tutor.average_rating}</span>
                    <span className="ml-1 text-sm text-gray-500">
                      ({tutor.total_feedbacks})
                    </span>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
    </div>
  );
}
