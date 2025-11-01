export default function TutorSkeleton() {
  return (
    <li className="py-3 animate-pulse flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-gray-200 rounded-full" />
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-4 w-8 bg-gray-200 rounded" />
        <div className="h-3 w-6 bg-gray-200 rounded" />
      </div>
    </li>
  );
}
