// IMPORTANTE!: Mocks antes de cualquier import que los use, porque si intenta importarlos antes de que sean mockeados, falla
//porque Jest no sabe interpretar import.meta, que se usa en courseService.js

jest.mock("@components/NavBar", () => () => <div>NavBar</div>);
jest.mock("@components/Footer", () => () => <div>Footer</div>);

jest.mock("../../context/useCourses", () => ({
  useCourses: jest.fn(),
}));

jest.mock("../../context/useFiltredCourses", () => ({
  useFilteredCourses: jest.fn((courses) => courses),
}));


jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"), // mantener los demás exports reales
  useNavigate: () => jest.fn(),              // mock de useNavigate
}));


import { render, screen, fireEvent, act } from "@testing-library/react";
import CoursePage from "../pages/CoursePage";
import { useCourses } from "../../context/useCourses";

jest.mock("../../context/useCourses");

describe("CoursePage", () => {
  const mockSetPage = jest.fn();

  beforeAll(() => {
    // decimos a Jest que use timers falsos (controlados)
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("muestra el loading al inicio", () => {
    useCourses.mockReturnValue({
      courses: [],
      loading: true,
      error: null,
      pagination: {},
      page: 1,
      setPage: mockSetPage,
    });

    render(<CoursePage />);
    expect(screen.getByText(/cargando materias/i)).toBeInTheDocument();
  });

  it("muestra un mensaje de error si hay error", () => {
    useCourses.mockReturnValue({
      courses: [],
      loading: false,
      error: "Error",
      pagination: {},
      page: 1,
      setPage: mockSetPage,
    });

    render(<CoursePage />);
    expect(screen.getByText(/error al cargar las materias/i)).toBeInTheDocument();
  });

  it("muestra los cursos y la paginación", () => {
    useCourses.mockReturnValue({
      courses: [
        { id: 1, name: "Curso A" },
        { id: 2, name: "Curso B" },
      ],
      loading: false,
      error: null,
      pagination: { page: 1, last: 3 },
      page: 1,
      setPage: mockSetPage,
    });

    render(<CoursePage />);

    // Verifica que los cursos se muestren
    expect(screen.getByText("Curso A")).toBeInTheDocument();
    expect(screen.getByText("Curso B")).toBeInTheDocument();

    // Verifica que la paginación tenga botones
    const nextButton = screen.getByText(">");
    fireEvent.click(nextButton);
    expect(mockSetPage).toHaveBeenCalledWith(2);
  });

  it("muestra 'No hay materias disponibles' si no hay cursos", () => {
    useCourses.mockReturnValue({
      courses: [],
      loading: false,
      error: null,
      pagination: { page: 1, last: 1 },
      page: 1,
      setPage: mockSetPage,
    });

    render(<CoursePage />);
    expect(screen.getByText(/no hay materias disponibles/i)).toBeInTheDocument();
  });

    
  it("actualiza search y reinicia a la página 1 al cambiar el query", () => {
    const mockSetSearch = jest.fn();
    const mockSetPage = jest.fn();

    useCourses.mockReturnValue({
      courses: [],
      loading: false,
      error: null,
      pagination: { page: 1, last: 1 },
      page: 1,
      setPage: mockSetPage,
      search: "",
      setSearch: mockSetSearch,
    });

    render(<CoursePage />);

    const input = screen.getByPlaceholderText(/buscar materia/i);

    // Simula escribir algo
    fireEvent.change(input, { target: { value: "mat" } });

    // Avanza el tiempo del timeout
    act(() => {
      jest.advanceTimersByTime(400);
    });

    expect(mockSetSearch).toHaveBeenCalledWith("mat");
    expect(mockSetPage).toHaveBeenCalledWith(1);
  });

  it("usa totalPages = 1 cuando pagination.last no está definido", () => {
    const mockSetPage = jest.fn();

    useCourses.mockReturnValue({
      courses: [],
      loading: false,
      error: null,
      pagination: {}, // sin last
      page: 1,
      setPage: mockSetPage,
      search: "",
      setSearch: jest.fn(),
    });

    render(<CoursePage />);

  });


});