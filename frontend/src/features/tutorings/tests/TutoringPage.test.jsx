import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import TutoringPage from "../pages/TutoringPage";

const setPageMock = jest.fn();
jest.mock("../hooks/useTutorings", () => ({
  useTutorings: jest.fn(),
}));
import { useTutorings } from "../hooks/useTutorings";

// 2) Mock de TutoringList (solo muestra algo mínimo y expone props en data-* para asserts)
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
  default: (props) => <div>{TutoringListMock(props)}</div>,
}));

// 3) Mock de Pagination (renderiza botones básicos para simular interacción)
jest.mock("../../../shared/components/Pagination", () => ({
  __esModule: true,
  default: ({ page, setPage, totalPages }) => (
    <div data-testid="pagination" data-page={page} data-totalpages={totalPages}>
      <button onClick={() => setPage(page - 1)} disabled={page <= 1}>
        Prev
      </button>
      <span>Page {page} / {totalPages}</span>
      <button onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
        Next
      </button>
    </div>
  ),
}));

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

    render(<TutoringPage mode="select" filters={{ subject: "math" }} />);

    // Título
    expect(
      screen.getByRole("heading", { name: /Tutorías Disponibles/i })
    ).toBeInTheDocument();

    // TutoringList: chequeo de props pasadas
    const list = screen.getByTestId("tutoring-list");
    expect(list).toHaveAttribute("data-mode", "select");
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

    render(<TutoringPage />);

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

    render(<TutoringPage />);

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

    render(<TutoringPage mode="view" />);

    const list = screen.getByTestId("tutoring-list");
    expect(list).toHaveAttribute("data-loading", "true");
    expect(list).toHaveAttribute("data-error", "Algo salió mal");
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
    expect(filtrosLlamada).toEqual({ ...baseFilters, no_tutor: true });
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
    expect(call[2]).toEqual({ ...baseFilters, no_tutor: true });

    // 2) Desmarcar -> vuelve a filtros originales
    useTutorings.mockClear();
    fireEvent.click(cb);
    expect(cb).not.toBeChecked();
    call = useTutorings.mock.calls.at(-1);
    expect(call[2]).toEqual(baseFilters);
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
    expect(filtrosLlamada).toEqual({ ...baseFilters, no_tutor: true });
  });
});
