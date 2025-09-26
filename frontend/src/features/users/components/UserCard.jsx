import { HiArrowRight } from "react-icons/hi";
import { Link } from "react-router-dom";

export default function UserCard({ user }) {
  return (
    <div className="w-full bg-white rounded-lg shadow p-4 my-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
          {user.photo ? (
            <img
              src={user.photo}
              alt={`${user.name} ${user.last_name}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-xl font-semibold">
              {user.name?.charAt(0)?.toUpperCase()}
              {user.last_name?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </div>

        {/* Información del usuario */}
        <div className="flex flex-col items-start">
          <h2 className="text-black font-semibold text-lg">
            {user.name} {user.last_name}
          </h2>
          <p className="text-gray-600 text-sm">{user.email}</p>
        </div>
      </div>

      {/* Botón para ver perfil  --> Hay que ver si implementamos esto, debriamos */}
      {/* <Link to={`/usuarios/${user.id}`} className="block">
        <button
          type="button"
          className="inline-flex items-center text-white hover:text-white border border-gray-800 hover:bg-gray-900 focus:outline-none font-medium rounded-lg text-sm px-2 py-2 text-center me-2 mb-2 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 cursor-pointer"
        >
          <HiArrowRight className="w-5 h-5" />
        </button>
      </Link> */}
    </div>
  );
}
