import { useUser } from "../../features/users/hooks/user_context";
import { Link, useNavigate } from "react-router-dom";

export default function NavBar() {
    const { user, signOut } = useUser();
    const nav = useNavigate();

    async function handleLogout() {
        try {
        await signOut();
        nav("/", { replace: true });
        } catch (e) {
        console.error("Error en logout:", e);
        }
    }

    return (
        <nav className="bg-[#101f3f] p-4 text-white">
            <div className="container mx-auto flex justify-between items-center">
                <div className="text-lg font-bold">
                    <a href="/courses">
                        <img 
                          src="/src/assets/icon.png" 
                          alt="Study Circle" 
                          className="h-8 w-auto" 
                        />
                      </a>
                </div>

                {/* Si hay usuario logueado → mostramos nombre y botón de logout */}
                {user ? (
                    <div className="flex items-center space-x-4">
                        <span>Hola, {user.name}</span>
                        <button onClick={handleLogout} className="px-3 hover:underline">Cerrar sesión</button>
                    </div>
                ) : (
                // Si NO hay usuario logueado → mostramos links de login/registro
                    <div>
                        <Link to="/sign_in" className="px-3 hover:underline">Iniciar sesión</Link>
                        <Link to="/sign_up" className="px-3 hover:underline">Registrarse</Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
