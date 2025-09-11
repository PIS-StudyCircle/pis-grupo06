import { useEffect, useState } from "react";
import { useFaculties } from "../hooks/useFaculties";
import { FacultyCard } from "../components/FacultyCard";
import { useUser } from "../../users/user";
import { Link, useNavigate } from "react-router-dom";

export function FacultiesPage() {
  const { faculties } = useFaculties();
  const { user, signOut } = useUser();
  const nav = useNavigate();

  async function handleLogout() {
    try {
      await signOut();
      nav("/sign_in", { replace: true });
    } catch (e) {
      console.error("Error en logout:", e);
    }
  }

  const navStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "2rem",
    padding: "2rem",
    background: "#222",
    color: "#fff",
    fontSize: "2rem",
  };

  const buttonStyle = {
    padding: "1rem 2rem",
    fontSize: "2rem",
    background: "crimson",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
  };

  const linkStyle = {
    fontSize: "2rem",
    color: "dodgerblue",
    textDecoration: "none",
    padding: "1rem 2rem",
    border: "2px solid dodgerblue",
    borderRadius: "12px",
  };

  // Estado para guardar la respuesta del backend
  const [pingResponse, setPingResponse] = useState(null);

  // Llamada al backend en /ping
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/ping`)
      .then((res) => res.json())
      .then((data) => setPingResponse(data))
      .catch((err) => {
        console.error("Error al conectar con backend:", err);
        setPingResponse({ error: "No se pudo conectar con el backend" });
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <nav style={navStyle}>
        {user ? (
          <>
            <span style={{ fontSize: "2rem" }}>
              👋 Hola, {user?.name || user?.email || "usuario"}
            </span>
            <button style={buttonStyle} onClick={handleLogout}>
              🚪 Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link style={linkStyle} to="/sign_in">
              🔑 Ingresar
            </Link>
            <Link style={linkStyle} to="/sign_up">
              📝 Registrarme
            </Link>
          </>
        )}
      </nav>

      <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">
        ¿En cuál facultad estás interesado?
      </h1>

      {/* Mostrar resultado del backend */}
      <div className="max-w-5xl mx-auto mb-8 text-center">
        <h2 className="text-lg font-semibold text-green-700 mb-2">
          Estado del Backend:
        </h2>
        {pingResponse ? (
          <pre className="bg-white shadow-md rounded p-4 text-left">
            {JSON.stringify(pingResponse, null, 2)}
          </pre>
        ) : (
          <p className="text-gray-500">Conectando con backend...</p>
        )}
      </div>

      {/* Facultades */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {faculties.map((f) => (
          <FacultyCard key={f.id} faculty={f} />
        ))}
      </div>
    </div>
  );
}
