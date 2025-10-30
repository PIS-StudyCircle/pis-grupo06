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

  // Colores pálidos (pastel)
  const medalStyles = [
    { bg: "#FFF3BF", emoji: "🥇", textClass: "text-gray-800" }, // dorado suave
    { bg: "#F2F4F7", emoji: "🥈", textClass: "text-gray-800" }, // plateado suave
    { bg: "#F6E1CC", emoji: "🥉", textClass: "text-gray-800" }, // bronce suave
  ];

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
          tutors.map((tutor, index) => {
            const isTop3 = index < 3;
            const medal = isTop3 ? medalStyles[index] : null;

            return (
              <li
                key={tutor.id}
                className={`py-3 ${isTop3 ? "rounded-lg -mx-3 px-3 shadow-inner" : ""} ${isTop3 ? medal?.textClass : ""}`}
                style={isTop3 ? { backgroundColor: medal.bg } : {}}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isTop3 ? (
                      <span className="text-xl" aria-hidden>
                        {medal.emoji}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500 w-6 text-center">
                        {index + 1}.
                      </span>
                    )}

                    <span className={`font-medium ${isTop3 ? medal.textClass : "text-gray-800"}`}>
                      {isTop3 ? `${index + 1}. ${tutor.name}` : tutor.name}
                    </span>
                    <span className={`text-sm ${isTop3 ? medal.textClass + " opacity-90" : "text-gray-500"}`}>
                      ({tutor.email})
                    </span>
                  </div>

                  {/* Estrellas y puntuación */}
                  <div className={`flex items-center font-semibold text-base ${isTop3 ? medal.textClass : "text-yellow-500"}`}>
                    <span className="mr-1 text-lg">⭐</span>
                    <span>{tutor.average_rating}</span>
                    <span className={`ml-1 text-sm ${isTop3 ? medal.textClass + " opacity-90" : "text-gray-500"}`}>
                      ({tutor.total_feedbacks})
                    </span>
                  </div>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}