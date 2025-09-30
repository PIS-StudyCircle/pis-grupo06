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

// Mock de TutoringList
const TutoringListMock = ({ tutorings = [], mode = "", loading, error }) => (
  <div
    data-testid="tutoring-list"
    data-mode={mode}
    data-loading={String(!!loading)}
    data-error={error || ""}
  >
    {tutorings.map((t) => (
      <div key={t.id}>{t.title}</div>
    ))}
  </div>
);
jest.mock("../components/TutoringList", () => ({
  __esModule: true,
  default: (props) => <TutoringListMock {...props} />,
}));

// Mock de Pagination
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
} = {}) => {
  useTutorings.mockReturnValue({
    tutorings,
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


describe("TutoringPage", () => {
  test("renderiza el título y pasa props correctas a TutoringList", () => {
    mockUseTutorings({
      tutorings: [
        { id: 1, title: "Cálculo I" },
        { id: 2, title: "Programación II" },
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
    expect(screen.getByText("Cálculo I")).toBeInTheDocument();
    expect(screen.getByText("Programación II")).toBeInTheDocument();

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

  test("hace setPage al avanzar con la paginación", () => {
    mockUseTutorings({
      tutorings: [{ id: 10, title: "Estructuras de Datos" }],
      pagination: { last: 3 },
      page: 1,
    });

    renderWithRouter();

    fireEvent.click(screen.getByRole("button", { name: /Next/i }));
    expect(setPageMock).toHaveBeenCalledTimes(1);
    expect(setPageMock).toHaveBeenCalledWith(2);
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
});
