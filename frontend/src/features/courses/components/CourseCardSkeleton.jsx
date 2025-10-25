export default function CourseCardSkeleton() {
  return (
    <div className="w-full bg-white rounded-lg shadow p-4 my-4 flex flex-col gap-2 animate-pulse">
      <div className="flex items-center gap-2 w-full">
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="w-8 h-8 rounded-full bg-gray-200 ml-auto"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
  );
}
