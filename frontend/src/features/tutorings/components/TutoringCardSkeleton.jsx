export default function TutoringCardSkeleton() {
  return (
    <div
      role="progressbar"
      className="w-full bg-white rounded-lg shadow p-4 my-4 animate-pulse"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1 flex flex-col text-left space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>

          <div className="flex flex-wrap gap-2 mt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-6 w-16 bg-gray-200 rounded-full"
              ></div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 md:pr-3 w-32">
          <div className="h-10 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  );
}
