export function FacultyCard({ faculty }) {
  return (
    <div className="p-6 bg-white border rounded-xl shadow hover:shadow-lg hover:bg-blue-50 transition cursor-pointer">
      <h2 className="text-lg font-semibold text-black">{faculty.name}</h2>
    </div>
  );
}
