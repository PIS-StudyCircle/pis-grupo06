import { Link } from "react-router-dom";
import { DEFAULT_PHOTO } from "@/shared/config";

export default function UserCard({ user }) {
  const photoUrl = user.photo ? user.photo : DEFAULT_PHOTO;
  return (
    <div className="w-full bg-white rounded-lg shadow p-4 my-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
          <img
            src={photoUrl}
            alt={`${user.name} ${user.last_name}`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Información del usuario */}
        <div className="flex flex-col items-start">
          <Link
            to={`/usuarios/${user.id}`}
            className="text-black font-semibold text-lg hover:underline"
          >
            {user.name} {user.last_name}
          </Link>
          <p className="text-gray-600 text-sm">{user.email}</p>
        </div>
      </div>
    </div>
  );
}
