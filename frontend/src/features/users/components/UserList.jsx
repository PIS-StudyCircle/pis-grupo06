import UserCard from "./UserCard";
import UserCardSkeleton from "./UserCardSkeleton";

export default function UserList({ users, loading, error, msj =  "No hay usuarios disponibles." }) {
  if (loading) return (
    <div>
      {[...Array(5)].map((_, i) => (
        <UserCardSkeleton key={i} />
      ))}
    </div>
  );
  if (error) return <div>Error al cargar los usuarios. </div>;
  if (!users || users.length === 0)
    return <div>{msj}</div>;

  return (
    <div className="flex flex-col">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
