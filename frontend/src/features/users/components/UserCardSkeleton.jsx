export default function UserCardSkeleton() {
  return (
    <div className="w-full bg-white rounded-lg shadow p-4 my-4 flex items-center justify-between gap-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-200"></div>
        <div className="flex flex-col space-y-2">
          <div className="h-4 bg-gray-200 rounded w-40"></div>
          <div className="h-3 bg-gray-200 rounded w-28"></div>
        </div>
      </div>
    </div>
  );
}
