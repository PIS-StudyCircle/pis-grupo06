export default function TutorCard({ tutor, index }) {
  const medalStyles = [
    { bg: "#FFF3BF", emoji: "🥇", textClass: "text-gray-800" },
    { bg: "#F2F4F7", emoji: "🥈", textClass: "text-gray-800" },
    { bg: "#F6E1CC", emoji: "🥉", textClass: "text-gray-800" },
  ];

  const isTop3 = index < 3;
  const medal = isTop3 ? medalStyles[index] : null;

  return (
    <li
      key={tutor.id}
      className={`py-3 ${isTop3 ? "rounded-lg -mx-3 px-3 shadow-inner" : ""} ${isTop3 ? medal.textClass : ""}`}
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
            {tutor.name} {tutor.last_name}
          </span>
        </div>

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
}
