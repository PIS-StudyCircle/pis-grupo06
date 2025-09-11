import { useState } from "react";
import { useUser } from "../user";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

export default function RegisterPage() {
  const { signup } = useUser();
  const nav = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    password_confirmation: "",
    name: "",
    last_name: "",
    description: "",
  });
  const [error, setErr] = useState("");

  function set(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    if (form.password.length < 6) {
      setErr("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (form.password !== form.password_confirmation) {
      setErr("Las contraseñas no coinciden.");
      return;
    }

    try {
      await signup(form);
      nav("/");
    } catch (e) {
      setErr(e?.data?.status?.message || "No se pudo crear la cuenta");
    }
  }

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
        <form onSubmit={onSubmit} className="space-y-6">
          
          {/* PASO 3: Añadimos el nuevo campo "Name". */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={(e) => set("name",e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Añadimos el nuevo campo "Lastname". */}
          <div>
            <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">
              Lastname
            </label>
            <input
              id="lastname"
              name="lastname"
              type="text"
              required
              value={form.last_name}
              onChange={(e) => set("last_name",e.target.value)}
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
              value={form.email}
              onChange={(e) => set("email",e.target.value)}
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
              value={form.password}
              onChange={(e) => set("password",e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Campo de confirmacion de Contraseña (sin cambios) */}
          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
              Password confirmation
            </label>
            <input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              required
              value={form.password_confirmation}
              onChange={(e) => set("password_confirmation",e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Campo de descripcion */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={(e) => set("description",e.target.value)}
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
          <a href="/sign_in" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </a>
        </p>

      </div>
    </div>
  );
}
