import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Link, useNavigate } from "react-router-dom";


const mockAuthState = {
  isAuthenticated: false,
  user: null,
};

const mockSignIn = jest.fn(async () => {
  mockAuthState.isAuthenticated = true;
  mockAuthState.user = { id: 1, name: "Ana" };
});
const mockSignUp = jest.fn(async () => {
  mockAuthState.isAuthenticated = true;
  mockAuthState.user = { id: 2, name: "Nuevo" };
});
const mockSignOut = jest.fn(async () => {
  mockAuthState.isAuthenticated = false;
  mockAuthState.user = null;
});

jest.mock("@context/UserContext", () => ({
  useUser: () => ({
    isAuthenticated: mockAuthState.isAuthenticated,
    user: mockAuthState.user,
    signIn: mockSignIn,
    signUp: mockSignUp,
    signOut: mockSignOut,
  }),
}));

function FakeSidebar() {
  const { isAuthenticated } = require("@context/UserContext").useUser();
  return (
    <nav aria-label="sidebar">
      <Link to="/">Inicio</Link>{" | "}
      {!isAuthenticated && <Link to="/iniciar-sesion">Iniciar sesión</Link>}
      {!isAuthenticated && <Link to="/registro">Registrarse</Link>}
      {isAuthenticated && <Link to="/perfil">Perfil</Link>}
      {isAuthenticated && <Link to="/mis-clases">Mis clases</Link>}
      {isAuthenticated && <Link to="/salir">Salir</Link>}
    </nav>
  );
}

function PrivateRoute({ children }) {
  const { isAuthenticated } = require("@context/UserContext").useUser();
  if (!isAuthenticated) {
    return <div role="alert">Acceso restringido</div>;
  }
  return children;
}

function HomePage() {
  return <h1>Home</h1>;
}
function PerfilPage() {
  const { user } = require("@context/UserContext").useUser();
  return <h1>Perfil de {user?.name}</h1>;
}
function MisClasesPage() {
  return <h1>Mis Clases</h1>;
}

function SignInPageMock() {
  const { signIn } = require("@context/UserContext").useUser();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    await signIn({ email: "a@a.com", password: "123456" });
    navigate("/");
  };

  return (
    <form onSubmit={onSubmit}>
      <h1>Iniciar sesión</h1>
      <button type="submit">Ingresar</button>
    </form>
  );
}

function RegisterPageMock() {
  const { signUp } = require("@context/UserContext").useUser();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    await signUp({ email: "nuevo@a.com", password: "123456" });
    navigate("/");
  };

  return (
    <form onSubmit={onSubmit}>
      <h1>Registrarse</h1>
      <button type="submit">Crear cuenta</button>
    </form>
  );
}

function LogoutPageMock() {
  const { signOut } = require("@context/UserContext").useUser();
  const navigate = useNavigate();

  React.useEffect(() => {
    (async () => {
      await signOut();
      navigate("/");
    })();
  }, [signOut, navigate]);

  return <div>Saliendo…</div>;
}

function TestApp({ initialPath = "/" }) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <FakeSidebar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/iniciar-sesion" element={<SignInPageMock />} />
        <Route path="/registro" element={<RegisterPageMock />} />
        <Route
          path="/perfil"
          element={
            <PrivateRoute>
              <PerfilPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/mis-clases"
          element={
            <PrivateRoute>
              <MisClasesPage />
            </PrivateRoute>
          }
        />
        <Route path="/salir" element={<LogoutPageMock />} />
        <Route path="*" element={<div>404</div>} />
      </Routes>
    </MemoryRouter>
  );
}

function setLoggedOut() {
  mockAuthState.isAuthenticated = false;
  mockAuthState.user = null;
  mockSignIn.mockClear();
  mockSignUp.mockClear();
  mockSignOut.mockClear();
}

function setLoggedIn(user = { id: 9, name: "Logueado" }) {
  mockAuthState.isAuthenticated = true;
  mockAuthState.user = user;
  mockSignIn.mockClear();
  mockSignUp.mockClear();
  mockSignOut.mockClear();
}

describe("Flujos de auth + Sidebar + acceso rutas protegidas", () => {
  beforeEach(() => {
    setLoggedOut(); 
  });

  test("Registrarse: submit OK, sidebar muestra items de logueado y se accede a rutas protegidas", async () => {
    render(<TestApp initialPath="/registro" />);

    expect(screen.getByRole("link", { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /registrarse/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /mis clases/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /perfil/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));
    expect(mockSignUp).toHaveBeenCalled();

 
    expect(await screen.findByRole("link", { name: /mis clases/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /perfil/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: /mis clases/i }));
    expect(await screen.findByRole("heading", { name: /mis clases/i })).toBeInTheDocument();
  });

  test("Iniciar sesión: submit OK, sidebar muestra items de logueado y se accede a rutas protegidas", async () => {
    render(<TestApp initialPath="/iniciar-sesion" />);

    expect(screen.getByRole("link", { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /registrarse/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /mis clases/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /ingresar/i }));
    expect(mockSignIn).toHaveBeenCalled();

    expect(await screen.findByRole("link", { name: /mis clases/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /perfil/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: /perfil/i }));
    expect(await screen.findByRole("heading", { name: /perfil de/i })).toBeInTheDocument();
  });

  test("Desloguearse: oculta ítems protegidos y bloquea acceso directo a rutas protegidas", async () => {
    setLoggedIn({ id: 7, name: "Mario" });
    render(<TestApp initialPath="/" />);

    expect(screen.getByRole("link", { name: /mis clases/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /perfil/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: /salir/i }));
    expect(mockSignOut).toHaveBeenCalled();

    expect(await screen.findByRole("link", { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /mis clases/i })).not.toBeInTheDocument();

    render(<TestApp initialPath="/mis-clases" />);
    expect(screen.getByRole("alert")).toHaveTextContent(/Acceso restringido/i);
  });
});
