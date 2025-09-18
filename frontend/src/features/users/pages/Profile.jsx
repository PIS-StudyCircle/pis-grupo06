import { useState } from "react";
import { Pencil, Save, ArrowLeft } from "lucide-react";

export default function Profile() {
  const [form, setForm] = useState({
    username: "alexfernandez",
    descripcion: "Estudiante de matemáticas y física. Me gusta aprender en conjunto y compartir ideas.",
    email: "alexfernandez@gmail.com",
    password: "********"
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos guardados:", form);
    // Aquí llamarías a tu API para guardar los cambios
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-[#001F54] text-white rounded-3xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Editar Perfil</h2>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="https://avatars.githubusercontent.com/u/9919?s=280&v=4" // reemplaza con la foto real
            alt="avatar"
            className="w-24 h-24 rounded-full border-4 border-white shadow-md"
          />
          <button className="mt-3 text-sm bg-blue-600 px-4 py-1 rounded-full">
            Cambiar foto
          </button>
          <p className="mt-2 font-semibold">Alex Fernández <Pencil className="inline w-4 h-4 ml-1" /></p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full rounded-lg px-3 py-2 text-black"
            />
          </div>

          <div>
            <label className="block text-sm">Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg px-3 py-2 text-black"
            />
          </div>

          <div>
            <label className="block text-sm">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg px-3 py-2 text-black"
            />
          </div>

          <div>
            <label className="block text-sm">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-lg px-3 py-2 text-black"
            />
          </div>

          <div className="flex justify-between mt-6">
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4" /> Save
            </button>
            <button
              type="button"
              className="flex items-center gap-2 bg-gray-500 px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
