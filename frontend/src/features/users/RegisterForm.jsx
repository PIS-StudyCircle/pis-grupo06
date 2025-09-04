import React, { useState } from 'react';
// Asumimos que el logo es el mismo, así que lo reutilizamos.
import logo from '../../assets/logo.png'; 

function RegisterForm() {
  // PASO 1: Añadimos un nuevo estado para el nombre de usuario.
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault(); // Evita que la página se recargue.
    setError(null);

    // Lógica para enviar los datos de registro al backend.
    // La URL y el formato del body probablemente serán diferentes al del login.
    console.log('Registrando usuario:', { username, email, password });

    try {
      const response = await fetch('http://localhost:3000/signup', { // <-- URL para el endpoint de registro en Rails.
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: { // Rails Devise suele esperar este formato para el registro también.
            username: username, // <-- Enviamos el nuevo campo.
            email: email,
            password: password,
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Maneja errores del servidor (ej: email ya existe).
        throw new Error(data.message || 'Error al registrar la cuenta.');
      }

      // Si el registro es exitoso:
      console.log('Registro exitoso!', data);
      // Aquí podrías redirigir al usuario a la página de login o directamente a la app.
      // window.location.href = '/login';

    } catch (err) {
      console.error('Error en el handleSubmit de registro:', err.message);
      setError(err.message);
    }
  };

  return (
    // Contenedor principal
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      
      {/* La tarjeta del formulario */}
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        
        {/* Encabezado */}
        <div className="text-center">
          <img src={logo} alt="Study Circle Logo" className="w-20 h-20 mx-auto" />
          {/* PASO 2: Cambiamos el texto del título. */}
          <h1 className="text-2xl font-bold text-gray-800 mt-4">
            Signup Your Account
          </h1>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* PASO 3: Añadimos el nuevo campo "Username". */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Campo de Email (sin cambios) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          {/* Campo de Contraseña (sin cambios) */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          {/* Mostramos un mensaje de error si existe */}
          {error && <p className="text-sm text-center text-red-600">{error}</p>}

          {/* Botón de Sign Up */}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-semibold text-white bg-gray-900 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              {/* PASO 4: Cambiamos el texto del botón. */}
              Sign Up
            </button>
          </div>

        </form>

        {/* Enlace para iniciar sesión */}
        <p className="text-sm text-center text-gray-600">
          {/* PASO 5: Cambiamos el texto del enlace final. */}
          Already have an account?{' '}
          <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </a>
        </p>

      </div>
    </div>
  );
}

export default RegisterForm;