import React from "react";
import { MemoryRouter, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import { render, screen, fireEvent } from "@testing-library/react";

import TutoringPage from "@features/tutorings/pages/TutoringPage";

// Hook y componentes necesarios
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
    <button onClick={() => setPage(page - 1)} disabled={page <= 1}>Prev</button>
    <span>Page {page} / {totalPages}</span>
    <button onClick={() => setPage(page + 1)} disabled={page >= totalPages}>Next</button>
  </div>
));

// Mocks de páginas del flujo
// cursos
function CoursePageMock() {
  return (
    <div>
      <h1>Cursos</h1>
      <ul>
        <li><Link to="/cursos/123">Ir a Curso 123</Link></li>
      </ul>
    </div>
  );
}

// cursos/:id
function CourseDetailPageMock() {
  const { id } = useParams();
  return (
    <div>
      <h1>Detalle Curso {id}</h1>
      <Link to={`/cursos/${id}/materias`}>Ver materias</Link>
    </div>
  );
}

// cursos/:id/materias
function SubjectPageMock() {
  const { id } = useParams();
  return (
    <div>
      <h1>Materias del curso {id}</h1>
      <ul>
        <li><Link to={`/materias/555`}>Ir a Materia 555</Link></li>
      </ul>
    </div>
  );
}

// materias/:id
function SubjectDetailPageMock() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <div>
      <h1>Materia {id}</h1>
      <button onClick={() => navigate("/tutorias/crear/tutor")}>
        Crear tutoría (tutor)
      </button>
    </div>
  );
}

// tutorias/crear/tutor
function CreateTutoringByTutorMock() {
  const navigate = useNavigate();
  return (
    <div>
      <h1>Crear tutoría (tutor)</h1>
      <button onClick={() => navigate("/tutorias")}>Publicar</button>
    </div>
  );
}

describe("Flujo de integración: Curso → Materia → Crear tutoría (tutor) → TutoringPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTutorings.mockReturnValue({
      tutorings: [{ id: 77, title: "Nueva tutoría publicada" }],
      loading: false,
      error: null,
      pagination: { last: 1 },
      page: 1,
      setPage: setPageMock,
    });
  });

  function App() {
    return (
      <MemoryRouter initialEntries={["/cursos"]}>
        <Routes>
          <Route path="/cursos" element={<CoursePageMock />} />
          <Route path="/cursos/:id" element={<CourseDetailPageMock />} />
          <Route path="/cursos/:id/materias" element={<SubjectPageMock />} />
          <Route path="/materias/:id" element={<SubjectDetailPageMock />} />
          <Route path="/tutorias/crear/tutor" element={<CreateTutoringByTutorMock />} />
          <Route path="/tutorias" element={<TutoringPage filters={{}} mode="serTutor" />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it("recorre el flujo completo y termina mostrando la lista de tutorías", () => {
    render(<App />);

    // CoursePage
    expect(screen.getByRole("heading", { name: /Cursos/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: /Ir a Curso 123/i }));

    // CourseDetailPage
    expect(screen.getByRole("heading", { name: /Detalle Curso 123/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: /Ver materias/i }));

    // SubjectPage
    expect(screen.getByRole("heading", { name: /Materias del curso 123/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: /Ir a Materia 555/i }));

    // SubjectDetailPage
    expect(screen.getByRole("heading", { name: /Materia 555/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Crear tutoría \(tutor\)/i }));

    // CreateTutoringByTutor
    expect(screen.getByRole("heading", { name: /Crear tutoría \(tutor\)/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Publicar/i }));

    // TutoringPage
    expect(
      screen.getByRole("heading", { name: /Tutorías Disponibles/i })
    ).toBeInTheDocument();

    // Verificamos que el hook corra y reciba filtros
    const lastCall = mockUseTutorings.mock.calls.at(-1);
    expect(lastCall[0]).toBe(1);
    expect(lastCall[1]).toBe(20);
    expect(lastCall[2]).toEqual(expect.objectContaining({})); // sin filtros iniciales obligatorios

    // Pagination y lista final visibles
    expect(screen.getByTestId("pagination")).toHaveAttribute("data-totalpages", "1");
    const props = JSON.parse(screen.getByTestId("tutoring-list-props").textContent);
    expect(props.tutorings).toEqual([{ id: 77, title: "Nueva tutoría publicada" }]);
    expect(props.mode).toBe("serTutor");
  });
});
