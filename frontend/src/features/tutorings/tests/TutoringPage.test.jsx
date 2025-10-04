import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import TutoringPage from "../pages/TutoringPage";
import { MemoryRouter, Routes, Route } from "react-router-dom";

// ------------------- mocks -------------------
const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

const setPageMock = jest.fn();
jest.mock("../hooks/useTutorings", () => ({
  useTutorings: jest.fn(),
}));
import { useTutorings } from "../hooks/useTutorings";

// 2) Mock de TutoringSearchBar
const TutoringSearchBarMock = ({ query, onQueryChange, searchBy, onSearchByChange, placeholder }) => (
  <div data-testid="tutoring-search-bar">
    <input
      data-testid="query-input"
      value={query ?? ""}
      onChange={(e) => onQueryChange(e)}
      placeholder={placeholder}
    />
    <select
      data-testid="search-by-select"
      value={searchBy}
      onChange={(e) => onSearchByChange(e.target.value)}
    >
      <option value="course">Materia</option>
      <option value="subject">Tema</option>
    </select>
  </div>
);
jest.mock("../components/TutoringSearchBar", () => ({
  __esModule: true,
  default: (props) => <div>{TutoringSearchBarMock(props)}</div>,
}));

// 3) Mock de TutoringList (solo muestra algo mínimo y expone props en data-* para asserts)
const TutoringListMock = ({ tutorings = [], mode = "", loading, error }) => (
  <div data-testid="tutoring-list" data-mode={mode} data-loading={String(!!loading)} data-error={error || ""}>
    {tutorings.map((t) => (
      <div key={t.id}>
        <div>
          <b>Materia: </b>
          {t.course?.name}
        </div>
        <div>
          <b>Temas:</b>
          {t.subjects?.map((s) => (
            <span key={s.id}>{s.name}</span>
          ))}
        </div>
      </div>
    ))}
  </div>
);
jest.mock("../components/TutoringList", () => ({
  __esModule: true,
  default: (props) => <TutoringListMock {...props} />,
}));

// 4) Mock de Pagination (renderiza botones básicos para simular interacción)
jest.mock("../../../shared/components/Pagination", () => ({
  __esModule: true,
  default: ({ page, setPage, totalPages }) => (
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
  ),
}));

// ------------------- helpers -------------------
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

const mockUseTutorings = ({
  tutorings = [],
  loading = false,
  error = null,
  pagination = {},
  page = 1,
  setPage = setPageMock,
  query = "",
  searchBy = "course",
} = {}) => {
  // Filtrado simulado
  let filtered = tutorings;
  const normalize = (str) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  if (query) {
    if (searchBy === "course") {
      filtered = tutorings.filter(t =>
        normalize(t.course.name).includes(normalize(query))
      );
    } else {
      filtered = tutorings.filter(t =>
        t.subjects.some(s => normalize(s.name).includes(normalize(query)))
      );
    }
  }
  useTutorings.mockReturnValue({
    tutorings: filtered,
    loading,
    error,
    pagination,
    page,
    setPage,
  });
};

function renderWithRouter(courseId = "123", mode = "serTutor") {
  return render(
    <MemoryRouter initialEntries={[`/tutorings/${courseId}`]}>
      <Routes>
        <Route path="/tutorings/:courseId" element={<TutoringPage mode={mode} />} />
      </Routes>
    </MemoryRouter>
  );
}

const countMateria = (materia) => {
  const list = screen.getByTestId("tutoring-list");
  // Busca todos los divs hijos directos (cada tutoría)
  return Array.from(list.children).filter((tutDiv) =>
    Array.from(tutDiv.children).some(
      (child) =>
        child.textContent &&
        child.textContent.replace(/\s+/g, " ").includes(`Materia: ${materia}`)
    )
  ).length;
};

const countTema = (tema) => {
  const list = screen.getByTestId("tutoring-list");
  return Array.from(list.querySelectorAll("span")).filter(
    (span) => span.textContent.trim() === tema
  ).length;
};

describe("TutoringPage", () => {
  const baseTutorings = [
    { id: 1, course: { name: "Cálculo 1" }, subjects: [{ id: 1, name: "Derivadas" }] },
    { id: 2, course: { name: "Cálculo 1" }, subjects: [{ id: 1, name: "Derivadas" }] },
    { id: 3, course: { name: "Cálculo 1" }, subjects: [{ id: 1, name: "Derivadas" }, { id: 2, name: "Integrales" }] },
    { id: 4, course: { name: "Cálculo 2" }, subjects: [{ id: 3, name: "Derivadas" }] },
    { id: 5, course: { name: "Programación 2" }, subjects: [{ id: 4, name: "Mecánica" }, {id: 5, name: "Robótica"}] },
    { id: 6, course: { name: "Robótica" }, subjects: [{ id: 6, name: "Mecánica" }] },
  ];

  test("renderiza el título y pasa props correctas a TutoringList", () => {
    mockUseTutorings({
      tutorings: [
        { id: 1, course: { name: "Cálculo 1" }, subjects: [{ id: 1, name: "Derivadas" }] },
        { id: 2, course: { name: "Programación 2" }, subjects: [{ id: 2, name: "Listas" }] },
      ],
      pagination: { last: 5 },
      page: 1,
    });
    renderWithRouter();

    // Título
    expect(screen.getByRole("heading", { name: /Tutorías Disponibles/i })).toBeInTheDocument();

    // TutoringList: chequeo de props pasadas
    const list = screen.getByTestId("tutoring-list");
    expect(list).toHaveAttribute("data-mode", "serTutor");
    expect(list).toHaveAttribute("data-loading", "false");
    expect(list).toHaveAttribute("data-error", "");
    expect(countMateria("Cálculo 1")).toBe(1);
    expect(countMateria("Programación 2")).toBe(1);

    // Pagination renderizada con totalPages=5
    const pagination = screen.getByTestId("pagination");
    expect(pagination).toHaveAttribute("data-totalpages", "5");
    expect(pagination).toHaveAttribute("data-page", "1");
  });

  test("usa totalPages=1 cuando pagination.last es falsy", () => {
    mockUseTutorings({
      tutorings: [],
      pagination: {}, // sin 'last'
      page: 1,
    });

    renderWithRouter();

    const pagination = screen.getByTestId("pagination");
    expect(pagination).toHaveAttribute("data-totalpages", "1");
    expect(screen.getByText(/Page 1 \/ 1/)).toBeInTheDocument();
  });

  test("propaga estados de loading y error a TutoringList", () => {
    mockUseTutorings({
      tutorings: [],
      loading: true,
      error: "Algo salió mal",
      pagination: { last: 2 },
      page: 1,
    });

    renderWithRouter();

    const list = screen.getByTestId("tutoring-list");
    expect(list).toHaveAttribute("data-loading", "true");
    expect(list).toHaveAttribute("data-error", "Algo salió mal");
  });

  test("filtra todas las tutorías por materia", () => {
    mockUseTutorings({
      tutorings: baseTutorings,
      pagination: { last: 1 },
      page: 1,
      query: "",
      searchBy: "course",
    });

    render(<TutoringPage />);

    const searchBar = screen.getByTestId("tutoring-search-bar");
    expect(searchBar).toBeInTheDocument();
    const queryInput = screen.getByTestId("query-input");
    const searchBySelect = screen.getByTestId("search-by-select");

    expect(queryInput).toHaveValue("");
    expect(searchBySelect).toHaveValue("course");

    expect(countMateria("Cálculo")).toBe(4);
    expect(countMateria("Cálculo 1")).toBe(3);
    expect(countMateria("Cálculo 2")).toBe(1);
    expect(countMateria("Programación 2")).toBe(1);
    expect(countMateria("Robótica")).toBe(1);
    
  });

  test("filtra varias tutorías por materia", () => {
    mockUseTutorings({
      tutorings: baseTutorings,
      pagination: { last: 1 },
      page: 1,
      query: "",
      searchBy: "course",
    });

    render(<TutoringPage />);

    const searchBar = screen.getByTestId("tutoring-search-bar");
    expect(searchBar).toBeInTheDocument();
    const queryInput = screen.getByTestId("query-input");
    const searchBySelect = screen.getByTestId("search-by-select");

    expect(queryInput).toHaveValue("");
    expect(searchBySelect).toHaveValue("course");

    expect(countMateria("Cálculo")).toBe(4);
    expect(countMateria("Cálculo 1")).toBe(3);
    expect(countMateria("Cálculo 2")).toBe(1);
    expect(countMateria("Programación 2")).toBe(1);
    expect(countMateria("Robótica")).toBe(1);
    
    fireEvent.change(queryInput, { target: { value: "calc" } });
    expect(queryInput).toHaveValue("calc");

    mockUseTutorings({
      tutorings: baseTutorings,
      pagination: { last: 1 },
      page: 1,
      query: "calc",
      searchBy: "course",
    });
    cleanup();
    render(<TutoringPage />);

    expect(countMateria("Cálculo")).toBe(4);
    expect(countMateria("Cálculo 1")).toBe(3);
    expect(countMateria("Cálculo 2")).toBe(1);
    expect(countMateria("Programación II")).toBe(0);
    expect(countMateria("Robótica")).toBe(0);
    
  });

  test("filtra una tutoría por materia", () => {
    mockUseTutorings({
      tutorings: baseTutorings,
      pagination: { last: 1 },
      page: 1,
      query: "",
      searchBy: "course",
    });

    render(<TutoringPage />);

    const searchBar = screen.getByTestId("tutoring-search-bar");
    expect(searchBar).toBeInTheDocument();

    const queryInput = screen.getByTestId("query-input");
    const searchBySelect = screen.getByTestId("search-by-select");
    expect(queryInput).toHaveValue("");
    expect(searchBySelect).toHaveValue("course");

    fireEvent.change(queryInput, { target: { value: "Robótica" } });
    expect(queryInput).toHaveValue("Robótica");

    mockUseTutorings({
      tutorings: baseTutorings,
      pagination: { last: 1 },
      page: 1,
      query: "Robótica",
      searchBy: "course",
    });
    cleanup();
    render(<TutoringPage />);

    expect(countMateria("Cálculo")).toBe(0);
    expect(countMateria("Programación 2")).toBe(0);
    expect(countMateria("Robótica")).toBe(1);
  });

   test("No filtra tutoría por materia", () => {
    mockUseTutorings({
      tutorings: baseTutorings,
      pagination: { last: 1 },
      page: 1,
      query: "",
      searchBy: "course",
    });

    render(<TutoringPage />);

    const searchBar = screen.getByTestId("tutoring-search-bar");
    expect(searchBar).toBeInTheDocument();

    const queryInput = screen.getByTestId("query-input");
    const searchBySelect = screen.getByTestId("search-by-select");
    expect(queryInput).toHaveValue("");
    expect(searchBySelect).toHaveValue("course");

    fireEvent.change(queryInput, { target: { value: "Mecánica" } });
    expect(queryInput).toHaveValue("Mecánica");

    mockUseTutorings({
      tutorings: baseTutorings,
      pagination: { last: 1 },
      page: 1,
      query: "Mecánica",
      searchBy: "course",
    });
    cleanup();
    render(<TutoringPage />);

    expect(countMateria("Cálculo")).toBe(0);
    expect(countMateria("Programación 2")).toBe(0);
    expect(countMateria("Robótica")).toBe(0);
  });

  test("filtra todas las tutorías por tema", () => {
    mockUseTutorings({
      tutorings: baseTutorings,
      pagination: { last: 1 },
      page: 1,
      query: "",
      searchBy: "course",
    });

    render(<TutoringPage />);

    const searchBar = screen.getByTestId("tutoring-search-bar");
    expect(searchBar).toBeInTheDocument();

    const queryInput = screen.getByTestId("query-input");
    expect(queryInput).toHaveValue("");

    const searchBySelect = screen.getByTestId("search-by-select");
    fireEvent.change(searchBySelect, { target: { value: "subject" } });
    expect(searchBySelect).toHaveValue("subject");

    expect(countTema("Derivadas")).toBe(4);
    expect(countTema("Integrales")).toBe(1);
    expect(countTema("Mecánica")).toBe(2);
    expect(countTema("Robótica")).toBe(1);
    
  });

  test("filtra varias tutorías por tema", () => {
    mockUseTutorings({
      tutorings: baseTutorings,
      pagination: { last: 1 },
      page: 1,
      query: "",
      searchBy: "course",
    });

    render(<TutoringPage />);

    const searchBar = screen.getByTestId("tutoring-search-bar");
    expect(searchBar).toBeInTheDocument();

    expect(countTema("Derivadas")).toBe(4);
    expect(countTema("Integrales")).toBe(1);
    expect(countTema("Mecánica")).toBe(2);
    expect(countTema("Robótica")).toBe(1);

    const queryInput = screen.getByTestId("query-input");
    const searchBySelect = screen.getByTestId("search-by-select");
    fireEvent.change(searchBySelect, { target: { value: "subject" } });
    expect(searchBySelect).toHaveValue("subject");
    fireEvent.change(queryInput, { target: { value: "meca" } });
    expect(queryInput).toHaveValue("meca");

    mockUseTutorings({
      tutorings: baseTutorings,
      pagination: { last: 1 },
      page: 1,
      query: "meca",
      searchBy: "subject",
    });
    cleanup();
    render(<TutoringPage />);

    expect(countTema("Derivadas")).toBe(0);
    expect(countTema("Integrales")).toBe(0);
    expect(countTema("Mecánica")).toBe(2);
    expect(countTema("Robótica")).toBe(1);
  });

  test("filtra una tutoría por tema", () => {
    mockUseTutorings({
      tutorings: baseTutorings,
      pagination: { last: 1 },
      page: 1,
      query: "",
      searchBy: "course",
    });

    render(<TutoringPage />);

    const searchBar = screen.getByTestId("tutoring-search-bar");
    expect(searchBar).toBeInTheDocument();

    const queryInput = screen.getByTestId("query-input");
    const searchBySelect = screen.getByTestId("search-by-select");
    expect(queryInput).toHaveValue("");
    expect(searchBySelect).toHaveValue("course");

    fireEvent.change(queryInput, { target: { value: "robo" } });
    expect(queryInput).toHaveValue("robo");
    fireEvent.change(searchBySelect, { target: { value: "subject" } });
    expect(searchBySelect).toHaveValue("subject");

    mockUseTutorings({
      tutorings: baseTutorings,
      pagination: { last: 1 },
      page: 1,
      query: "robo",
      searchBy: "subject",
    });
    cleanup();
    render(<TutoringPage />);

    expect(countTema("Derivadas")).toBe(0);
    expect(countTema("Integrales")).toBe(0);
    expect(countTema("Mecánica")).toBe(1);
    expect(countTema("Robótica")).toBe(1);
  });

  test("no filtra ninguna tutoría por tema", () => {
    mockUseTutorings({
      tutorings: baseTutorings,
      pagination: { last: 1 },
      page: 1,
      query: "",
      searchBy: "course",
    });

    render(<TutoringPage />);

    const searchBar = screen.getByTestId("tutoring-search-bar");
    expect(searchBar).toBeInTheDocument();

    const queryInput = screen.getByTestId("query-input");
    const searchBySelect = screen.getByTestId("search-by-select");
    expect(searchBySelect).toHaveValue("course");
    expect(queryInput).toHaveValue("");

    fireEvent.change(queryInput, { target: { value: "Programación 2" } });
    expect(queryInput).toHaveValue("Programación 2");
    fireEvent.change(searchBySelect, { target: { value: "subject" } });
    expect(searchBySelect).toHaveValue("subject");

    mockUseTutorings({
      tutorings: baseTutorings,
      pagination: { last: 1 },
      page: 1,
      query: "Programación 2",
      searchBy: "subject",
    });
    cleanup();
    render(<TutoringPage />);

    expect(countTema("Derivadas")).toBe(0);
    expect(countTema("Integrales")).toBe(0);
    expect(countTema("Mecánica")).toBe(0);
    expect(countTema("Robótica")).toBe(0);
  });

  test("Cambio de materia a temas y viceversa", () => {
    mockUseTutorings({
      tutorings: baseTutorings,
      pagination: { last: 1 },
      page: 1,
      query: "",
      searchBy: "course",
    });

    render(<TutoringPage />);

    const searchBar = screen.getByTestId("tutoring-search-bar");
    expect(searchBar).toBeInTheDocument();
    const queryInput = screen.getByTestId("query-input");
    const searchBySelect = screen.getByTestId("search-by-select");

    expect(queryInput).toHaveValue("");
    expect(searchBySelect).toHaveValue("course");

    expect(countMateria("Cálculo")).toBe(4);
    expect(countMateria("Cálculo 1")).toBe(3);
    expect(countMateria("Cálculo 2")).toBe(1);
    expect(countMateria("Programación 2")).toBe(1);
    expect(countMateria("Robótica")).toBe(1);

    fireEvent.change(searchBySelect, { target: { value: "subject" } });
    expect(searchBySelect).toHaveValue("subject");
    fireEvent.change(queryInput, { target: { value: "meca" } });
    expect(queryInput).toHaveValue("meca");

    mockUseTutorings({
      tutorings: baseTutorings,
      pagination: { last: 1 },
      page: 1,
      query: "meca",
      searchBy: "subject",
    });
    cleanup();
    render(<TutoringPage />);

    expect(countTema("Derivadas")).toBe(0);
    expect(countTema("Integrales")).toBe(0);
    expect(countTema("Mecánica")).toBe(2);
    expect(countTema("Robótica")).toBe(1);

    fireEvent.change(searchBySelect, { target: { value: "course" } });
    expect(searchBySelect).toHaveValue("course");
    fireEvent.change(queryInput, { target: { value: "Robótica" } });
    expect(queryInput).toHaveValue("Robótica");

    mockUseTutorings({
      tutorings: baseTutorings,
      pagination: { last: 1 },
      page: 1,
      query: "Robótica",
      searchBy: "course",
    });
    cleanup();
    render(<TutoringPage />);

    expect(countMateria("Cálculo")).toBe(0);
    expect(countMateria("Cálculo 1")).toBe(0);
    expect(countMateria("Cálculo 2")).toBe(0);
    expect(countMateria("Programación 2")).toBe(0);
    expect(countMateria("Robótica")).toBe(1);
    
  });


  test("muestra el checkbox 'Tutor Indefinido' y arranca desmarcado", () => {
    mockUseTutorings({
      tutorings: [],
      pagination: { last: 1 },
      page: 1,
    });

    render(<TutoringPage filters={{}} mode="" />);

    const cb = screen.getByLabelText(/Tutor Indefinido/i);
    expect(cb).toBeInTheDocument();
    expect(cb).not.toBeChecked();
  });

  test("al marcar 'Tutor Indefinido' agrega no_tutor=true a los filtros enviados al hook", () => {
    const baseFilters = { enrolled: true, course_id: "MAT101" };

    mockUseTutorings({
      tutorings: [],
      pagination: { last: 1 },
      page: 1,
    });

    render(<TutoringPage filters={baseFilters} mode="select" />);

    // Nos quedamos solo con las llamadas disparadas por el toggle
    useTutorings.mockClear();

    const cb = screen.getByLabelText(/Tutor Indefinido/i);
    fireEvent.click(cb); // marcar
    expect(cb).toBeChecked();

    // La última llamada a useTutorings debe incluir no_tutor: true
    expect(useTutorings).toHaveBeenCalled();
    const [, , filtrosLlamada] = useTutorings.mock.calls.at(-1);
    expect(filtrosLlamada).toMatchObject({ ...baseFilters, no_tutor: true });
    expect(filtrosLlamada.enrolled).toBe(true);
    expect(filtrosLlamada.course_id).toBe("MAT101");
  });

  test("al desmarcar 'Tutor Indefinido' vuelve a los filtros originales", () => {
    const baseFilters = { enrolled: false, created_by_user: "42" };

    mockUseTutorings({
      tutorings: [],
      pagination: { last: 2 },
      page: 1,
    });

    render(<TutoringPage filters={baseFilters} mode="view" />);

    const cb = screen.getByLabelText(/Tutor Indefinido/i);

    // 1) Marcar -> agrega no_tutor
    useTutorings.mockClear();
    fireEvent.click(cb);
    expect(cb).toBeChecked();
    let call = useTutorings.mock.calls.at(-1);
    expect(call[2]).toMatchObject({ ...baseFilters, no_tutor: true });

    // 2) Desmarcar -> vuelve a filtros originales
    useTutorings.mockClear();
    fireEvent.click(cb);
    expect(cb).not.toBeChecked();
    call = useTutorings.mock.calls.at(-1);
    expect(call[2]).toMatchObject(baseFilters);
    expect(call[2]).not.toHaveProperty("no_tutor");
  });

  test("conserva otros filtros al activar 'Tutor Indefinido'", () => {
    const baseFilters = { enrolled: true, created_by_user: "7", course_id: "FISICA1" };

    mockUseTutorings({
      tutorings: [],
      pagination: { last: 3 },
      page: 1,
    });

    render(<TutoringPage filters={baseFilters} mode="misTutorias" />);

    useTutorings.mockClear();
    fireEvent.click(screen.getByLabelText(/Tutor Indefinido/i));

    const [, , filtrosLlamada] = useTutorings.mock.calls.at(-1);
    expect(filtrosLlamada).toMatchObject({ ...baseFilters, no_tutor: true });
    expect(filtrosLlamada.created_by_user).toBe("7");
    expect(filtrosLlamada.course_id).toBe("FISICA1");
  });
});
