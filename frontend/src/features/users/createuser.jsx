import React, { useState } from 'react';

export default function CreateUserForm() {
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      name: form.name.value,
      last_name: form.last_name.value,
      email: form.email.value,
      password: form.password.value
    };

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) setStatus('Usuario creado');
    else setStatus('Error: email ya registrado');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Nombre" />
      <input name="last_name" placeholder="Apellido" />
      <input name="email" placeholder="Email" />
      <input name="password" placeholder="Contraseña" type="password" />
      <button type="submit">Crear Usuario</button>
      <p>{status}</p>
    </form>
  );
}