import UserCard from "./UserCard";

export default function UserList({ users, loading, error }) {
  if (loading) return <div>Cargando usuarios...</div>;
  if (error) return <div>Error al cargar los usuarios. </div>;
  if (!users || users.length === 0)
    return <div>No hay usuarios disponibles. </div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
