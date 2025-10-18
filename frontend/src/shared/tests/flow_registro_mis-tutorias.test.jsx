import React from "react";
import {
  MemoryRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import { render, screen, fireEvent } from "@testing-library/react";

import TutoringPage from "@features/tutorings/pages/TutoringPage";

const setPageMock = jest.fn();
const mockUseTutorings = jest.fn();

jest.mock("@features/tutorings/hooks/useTutorings", () => ({
  useTutorings: (...args) => mockUseTutorings(...args),
}));

jest.mock("@features/tutorings/components/TutoringList", () => (props) => (
  <div data-testid="tutoring-list-props">{JSON.stringify(props)}</div>
));

jest.mock("@components/Pagination", () => ({ page, setPage, totalPages }) => (
  <div data-testid="pagination" data-page={page} data-totalpages={totalPages}>
    <button onClick={() => setPage(page - 1)} disabled={page <= 1}>
      Prev
    </button>
    <span>
      Page {page} / {totalPages}
    </span>
    <button onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
      Next
    </button>
  </div>
));


// /registrarse
function RegisterPageMock() {
  const navigate = useNavigate();
  return (
    <div>
      <h1>Registrarse</h1>
      <button onClick={() => navigate("/intereses/materias")}>
        Crear cuenta
      </button>
    </div>
  );
}

// /intereses/materias
function SelectSubjectsMock() {
  const navigate = useNavigate();
  return (
    <div>
      <h1>Seleccionar Materias</h1>
      {/* Botones simbólicos de selección */}
      <button aria-label="Elegir Álgebra">Álgebra</button>
      <button aria-label="Elegir Análisis">Análisis</button>
      <button onClick={() => navigate("/tutorias/crear/estudiante")}>
        Continuar
      </button>
    </div>
  );
}

// tutorias/crear/estudiante
function CreateTutoringByStudentMock() {
  const navigate = useNavigate();
  return (
    <div>
      <h1>Crear tutoría (estudiante)</h1>
      {/* “Formulario” mínimo */}
      <label>
        Tema
        <input aria-label="Tema" />
      </label>
      <label>
        Capacidad
        <input aria-label="Capacidad" />
      </label>
      <button onClick={() => navigate("/tutorias")}>Publicar solicitud</button>
    </div>
  );
}

// perfil
function ProfilePageMock() {
  const navigate = useNavigate();
  return (
    <div>
      <h1>Perfil</h1>
      <button onClick={() => navigate("/mis-tutorias")}>Ver mis tutorías</button>
    </div>
  );
}

// Layout con un link persistente al perfil (para navegar desde /tutorias)
function Shell({ children }) {
  return (
    <div>
      <nav>
        <Link to="/perfil">Ir al Perfil</Link>
      </nav>
      {children}
    </div>
  );
}

describe("Flujo de integración: Registro → Selección → Crear tutoría (estudiante) → Perfil → Mis tutorías", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Al publicar solicitud y llegar a /tutorias
    mockUseTutorings.mockReturnValue({
      tutorings: [{ id: 101, title: "Solicitud publicada (estudiante)" }],
      loading: false,
      error: null,
      pagination: { last: 2 },
      page: 1,
      setPage: setPageMock,
    });
  });

  function App() {
    return (
      <MemoryRouter initialEntries={["/registrarse"]}>
        <Shell>
          <Routes>
            <Route path="/registrarse" element={<RegisterPageMock />} />
            <Route path="/intereses/materias" element={<SelectSubjectsMock />} />
            <Route
              path="/tutorias/crear/estudiante"
              element={<CreateTutoringByStudentMock />}
            />
            {/* Listado general de tutorías*/}
            <Route
              path="/tutorias"
              element={<TutoringPage filters={{}} mode="unirme" />}
            />
            {/* Perfil y Mis Tutorías */}
            <Route path="/perfil" element={<ProfilePageMock />} />
            <Route
              path="/mis-tutorias"
              element={
                // “enrolled: true”
                <TutoringPage filters={{ enrolled: true }} mode="misTutorias" />
              }
            />
          </Routes>
        </Shell>
      </MemoryRouter>
    );
  }

  it("recorre todo el flujo y valida integraciones clave", () => {
    render(<App />);

    // Registro
    expect(screen.getByRole("heading", { name: /Registrarse/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Crear cuenta/i }));

    // Selección de materias
    expect(
      screen.getByRole("heading", { name: /Seleccionar Materias/i })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Álgebra/i }));
    fireEvent.click(screen.getByRole("button", { name: /Análisis/i }));
    fireEvent.click(screen.getByRole("button", { name: /Continuar/i }));

    // Crear tutoría (estudiante)
    expect(
      screen.getByRole("heading", { name: /Crear tutoría \(estudiante\)/i })
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Tema/i), { target: { value: "Matrices" } });
    fireEvent.change(screen.getByLabelText(/Capacidad/i), { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: /Publicar solicitud/i }));

    // Llega a TutoringPage
    expect(
      screen.getByRole("heading", { name: /Tutorías Disponibles/i })
    ).toBeInTheDocument();

    const lastCallGeneral = mockUseTutorings.mock.calls.at(-1);
    expect(lastCallGeneral[0]).toBe(1);
    expect(lastCallGeneral[1]).toBe(20);
    expect(lastCallGeneral[2]).toEqual(expect.objectContaining({}));

    // Paginación visible e interacción
    expect(screen.getByTestId("pagination")).toHaveAttribute("data-totalpages", "2");
    fireEvent.click(screen.getByRole("button", { name: /Next/i }));
    expect(setPageMock).toHaveBeenCalledWith(2);

    // Ir al perfil desde el link persistente
    fireEvent.click(screen.getByRole("link", { name: /Ir al Perfil/i }));
    expect(screen.getByRole("heading", { name: /Perfil/i })).toBeInTheDocument();

    // Ver "Mis tutorías"
    mockUseTutorings.mockReturnValueOnce({
      tutorings: [{ id: 202, title: "Mi tutoría inscrita" }],
      loading: false,
      error: null,
      pagination: { last: 1 },
      page: 1,
      setPage: setPageMock,
    });

    fireEvent.click(screen.getByRole("button", { name: /Ver mis tutorías/i }));

    // Mis tutorías
    expect(
      screen.getByRole("heading", { name: /Tutorías Disponibles/i })
    ).toBeInTheDocument();

    const lastCallMine = mockUseTutorings.mock.calls.at(-1);
    expect(lastCallMine[2]).toEqual(expect.objectContaining({ enrolled: true }));

    const listProps = JSON.parse(
      screen.getByTestId("tutoring-list-props").textContent
    );
    expect(listProps.mode).toBe("misTutorias");
    expect(listProps.tutorings).toEqual([{ id: 202, title: "Mi tutoría inscrita" }]);
  });
});
