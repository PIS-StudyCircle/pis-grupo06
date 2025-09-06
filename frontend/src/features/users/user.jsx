import React from 'react';

export default function UserProfile({ user }) {
  if (!user) return <p>No hay usuario</p>;

  return (
    <div>
      <h2>{user.name} {user.last_name}</h2>
      <p>Materias: {user.subjects.join(', ')}</p>
    </div>
  );
}