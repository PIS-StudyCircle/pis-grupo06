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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {faculties.map((f) => (
          <FacultyCard key={f.id} faculty={f} />
        ))}
      </div>
    </div>
  );
}
