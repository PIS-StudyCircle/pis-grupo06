import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DEFAULT_PHOTO } from "@/shared/config";
import userEvent from "@testing-library/user-event";
import TutorPage from "../pages/TutorPage";
import * as usersHook from "../hooks/useUsers";

jest.mock("../hooks/useUsers");

jest.mock('@/shared/config', () => ({
  API_BASE: '/api/v1',
  DEFAULT_PHOTO: 'http://example.com/default-avatar.png'
}));

describe("TutorPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("muestra loading", () => {
    usersHook.useTutors.mockReturnValue({
      users: [],
      loading: true,
      error: null,
      pagination: {},
      page: 1,
      setPage: jest.fn(),
      search: "",
      setSearch: jest.fn(),
    });

    render(<TutorPage />);
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it("muestra mensaje de error", () => {
    usersHook.useTutors.mockReturnValue({
      users: [],
      loading: false,
      error: "Error al cargar los usuarios.",
      pagination: {},
      page: 1,
      setPage: jest.fn(),
      search: "",
      setSearch: jest.fn(),
    });

    render(<TutorPage />);
    expect(screen.getByText(/Error al cargar los usuarios./i)).toBeInTheDocument();
  });

  it("muestra la lista de tutores con sus imágenes o iniciales", () => {
    usersHook.useTutors.mockReturnValue({
      users: [
        { id: 1, name: "Juan", last_name: "Pérez", email: "juan@example.com", photo: "http://example.com/photo.jpg" },
        { id: 2, name: "Ana", last_name: "Gómez", email: "ana@example.com"},
      ],
      loading: false,
      error: null,
      pagination: { last: 1 },
      page: 1,
      setPage: jest.fn(),
      search: "",
      setSearch: jest.fn(),
    });

    render(
        <MemoryRouter>
          <TutorPage />
        </MemoryRouter>
      );

    // Usuarios renderizados
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("Ana Gómez")).toBeInTheDocument();

    // Imagen y iniciales
    expect(screen.getByAltText("Juan Pérez")).toHaveAttribute("src", "http://example.com/photo.jpg");
    expect(screen.getByAltText("Ana Gómez")).toHaveAttribute("src", DEFAULT_PHOTO);
  });

  it("muestra mensaje cuando no hay tutores", () => {
    usersHook.useTutors.mockReturnValue({
      users: [],
      loading: false,
      error: null,
      pagination: { last: 1 },
      page: 1,
      setPage: jest.fn(),
      search: "",
      setSearch: jest.fn(),
    });

    render(
        <MemoryRouter>
          <TutorPage />
        </MemoryRouter>
      );
    expect(screen.getByText(/No hay tutores disponibles./i)).toBeInTheDocument();
  });

  it("actualiza la búsqueda al escribir", async () => {
    const setSearch = jest.fn();
    const setPage = jest.fn();

    usersHook.useTutors.mockReturnValue({
      users: [],
      loading: false,
      error: null,
      pagination: { last: 1 },
      page: 1,
      setPage,
      search: "",
      setSearch,
    });

    render(
        <MemoryRouter>
          <TutorPage />
        </MemoryRouter>
      );

    const input = screen.getByPlaceholderText(/buscar tutor/i);
    await userEvent.type(input, "Ana");

    // Como TutorPage usa un debounce de 400ms, esperamos
    await waitFor(() => {
      expect(setSearch).toHaveBeenCalledWith("Ana");
      expect(setPage).toHaveBeenCalledWith(1);
    });
  });

  it("cambia de página con la paginación", async () => {
    const setPage = jest.fn();

    usersHook.useTutors.mockReturnValue({
      users: [],
      loading: false,
      error: null,
      pagination: { last: 5 },
      page: 1,
      setPage,
      search: "",
      setSearch: jest.fn(),
    });

    render(
        <MemoryRouter>
          <TutorPage />
        </MemoryRouter>
      );

    // Buscar un botón de paginación (suponiendo que Pagination renderiza números)
    const nextPage = screen.getByRole("button", { name: /2/i });
    await userEvent.click(nextPage);

    expect(setPage).toHaveBeenCalledWith(2);
  });
});