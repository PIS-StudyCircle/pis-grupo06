import { useState } from "react";
import { useUser } from "../user";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

export default function SignInPage() {
  const { signIn } = useUser();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await signIn(email, password);
      nav("/");
    } catch (e) {
      setErr(e?.data?.status?.message || "Error al iniciar sesión");
    }
  }

  return (
    // Contenedor principal: ocupa toda la pantalla y centra el contenido
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      
      {/* La tarjeta del formulario */}
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        
        {/* Encabezado con el logo y el título */}
        <div className="text-center">
          <img src={logo} alt="Study Circle Logo" className="w-20 h-20 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-800 mt-4">
            Sign in Your Account
          </h1>
        </div>

        {/* Formulario */}
        <form onSubmit={onSubmit} className="space-y-6">
          
          {/* Campo de Email */}
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
          
          {/* Campo de Contraseña */}
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
          
          {/* Opciones extra: Recordar y Olvidé contraseña */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
              <label htmlFor="remember-me" className="ml-2 block text-gray-900">
                Remember my preference
              </label>
            </div>
            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
              Forgot Password?
            </a>
          </div>

          {err && (
            <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
              {err}
            </div>)
          }

          {/* Botón de Sign In */}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-semibold text-white bg-gray-900 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              Sign In
            </button>
          </div>

        </form>

        {/* Enlace para registrarse */}
        <p className="text-sm text-center text-gray-600">
          Don't have an account?{' '}
          <a href="/sign_up" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign up
          </a>
        </p>

      </div>
    </div>
  );
}
