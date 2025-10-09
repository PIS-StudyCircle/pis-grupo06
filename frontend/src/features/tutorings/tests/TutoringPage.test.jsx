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
const TutoringSearchBarMock = ({
  query,
  onQueryChange,
  searchBy,
  onSearchByChange,
  placeholder,
}) => (
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

// 3) Mock de TutoringList
const TutoringListMock = ({ tutorings = [], mode = "", loading, error }) => (
  <div
    data-testid="tutoring-list"
    data-mode={mode}
    data-loading={String(!!loading)}
    data-error={error || ""}
  >
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

// 4) Mock de Pagination
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
  tutorings = [
    { id: 999, course: { name: "Dummy" }, subjects: [{ id: 1, name: "Tema" }] },
  ],
  loading = false,
  error = null,
  pagination = {},
  page = 1,
  setPage = setPageMock,
  query = "",
  searchBy = "course",
} = {}) => {
  let filtered = tutorings;
  const normalize = (str) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  if (query) {
    if (searchBy === "course") {
      filtered = tutorings.filter((t) =>
        normalize(t.course.name).includes(normalize(query))
      );
    } else {
      filtered = tutorings.filter((t) =>
        t.subjects.some((s) => normalize(s.name).includes(normalize(query)))
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
        <Route
          path="/tutorings/:courseId"
          element={<TutoringPage mode={mode} />}
        />
      </Routes>
    </MemoryRouter>
  );
}

const countMateria = (materia) => {
  const list = screen.getByTestId("tutoring-list");
  return Array.from(list.children).filter((tutDiv) =>
    Array.from(tutDiv.children).some((child) =>
      child.textContent?.replace(/\s+/g, " ").includes(`Materia: ${materia}`)
    )
  ).length;
};

const countTema = (tema) => {
  const list = screen.getByTestId("tutoring-list");
  return Array.from(list.querySelectorAll("span")).filter(
    (span) => span.textContent.trim() === tema
  ).length;
};

// ------------------- tests -------------------
describe("TutoringPage", () => {
  const baseTutorings = [
    {
      id: 1,
      course: { name: "Cálculo 1" },
      subjects: [{ id: 1, name: "Derivadas" }],
    },
    {
      id: 2,
      course: { name: "Programación 2" },
      subjects: [{ id: 2, name: "Listas" }],
    },
  ];

  test("renderiza el título y pasa props correctas a TutoringList", () => {
    mockUseTutorings({ tutorings: baseTutorings, pagination: { last: 5 }, page: 1 });
    renderWithRouter();

    expect(
      screen.getByRole("heading", { name: /Tutorías Disponibles/i })
    ).toBeInTheDocument();

    const list = screen.getByTestId("tutoring-list");
    expect(list).toHaveAttribute("data-mode", "serTutor");
    expect(list).toHaveAttribute("data-loading", "false");
    expect(list).toHaveAttribute("data-error", "");
    expect(countMateria("Cálculo 1")).toBe(1);
    expect(countMateria("Programación 2")).toBe(1);

    const pagination = screen.getByTestId("pagination");
    expect(pagination).toHaveAttribute("data-totalpages", "5");
  });

  test("usa totalPages=1 cuando pagination.last es falsy", () => {
    mockUseTutorings({ pagination: {}, page: 1 });
    renderWithRouter();

    const pagination = screen.getByTestId("pagination");
    expect(pagination).toHaveAttribute("data-totalpages", "1");
    expect(screen.getByText(/Page 1 \/ 1/)).toBeInTheDocument();
  });

  test("propaga estados de loading y error a TutoringList", () => {
    mockUseTutorings({
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

  test("muestra el checkbox 'Tutor Indefinido' y arranca desmarcado", () => {
    mockUseTutorings({ tutorings: baseTutorings });

    render(
      <MemoryRouter>
        <TutoringPage filters={{}} mode="" />
      </MemoryRouter>
    );

    const cb = screen.getByLabelText(/Tutor Indefinido/i);
    expect(cb).toBeInTheDocument();
    expect(cb).not.toBeChecked();
  });

  test("al marcar 'Tutor Indefinido' agrega no_tutor=true a los filtros enviados al hook", () => {
    const baseFilters = { enrolled: true, course_id: "MAT101" };
    mockUseTutorings({ tutorings: baseTutorings });

    render(
      <MemoryRouter>
        <TutoringPage filters={baseFilters} mode="select" />
      </MemoryRouter>
    );

    useTutorings.mockClear();

    const cb = screen.getByLabelText(/Tutor Indefinido/i);
    fireEvent.click(cb);
    expect(cb).toBeChecked();

    expect(useTutorings).toHaveBeenCalled();
    const [, , filtrosLlamada] = useTutorings.mock.calls.at(-1);
    expect(filtrosLlamada).toMatchObject({ ...baseFilters, no_tutor: true });
  });
});
