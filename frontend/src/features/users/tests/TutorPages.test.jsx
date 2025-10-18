import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DEFAULT_PHOTO } from "@/shared/config";
import userEvent from "@testing-library/user-event";
import TutorPage from "../pages/TutorListPage";
import * as usersServices from "../services/usersServices";

jest.mock("../services/usersServices");

jest.mock("@/shared/config", () => ({
  API_BASE: "/api/v1",
  DEFAULT_PHOTO: "http://example.com/default-avatar.png",
}));

describe("TutorPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default mock to prevent undefined returns
    usersServices.getUsers.mockResolvedValue({ users: [], pagination: { last: 1 } });
  });

  it("muestra loading", async () => {
    usersServices.getUsers.mockResolvedValueOnce({ users: [], pagination: {} });

    render(<TutorPage />);
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();

    // Wait for the loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument();
    });
  });

  it("muestra mensaje de error", async () => {
    usersServices.getUsers.mockRejectedValueOnce(
      new Error("Error al cargar los usuarios")
    );

    render(<TutorPage />);

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Error al cargar los usuarios/i)).toBeInTheDocument();
    });
  });

  it("muestra la lista de tutores con sus imágenes o iniciales", async () => {
    usersServices.getUsers.mockResolvedValueOnce({
      users: [
        {
          id: 1,
          name: "Juan",
          last_name: "Pérez",
          email: "juan@example.com",
          profile_photo_url: "http://example.com/photo.jpg",
        },
        { id: 2, name: "Ana", last_name: "Gómez", email: "ana@example.com" },
      ],
      pagination: { last: 1 },
    });

    render(
      <MemoryRouter>
        <TutorPage />
      </MemoryRouter>
    );

    expect(await screen.findByText("Juan Pérez")).toBeInTheDocument();
    expect(await screen.findByText("Ana Gómez")).toBeInTheDocument();

    expect(screen.getByAltText("Juan Pérez")).toHaveAttribute(
      "src",
      "http://example.com/photo.jpg"
    );
    expect(screen.getByAltText("Ana Gómez")).toHaveAttribute("src", DEFAULT_PHOTO);
  });

  it("muestra mensaje cuando no hay tutores", async () => {
    usersServices.getUsers.mockResolvedValueOnce({
      users: [],
      pagination: { last: 1 },
    });

    render(
      <MemoryRouter>
        <TutorPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/No hay tutores disponibles./i)).toBeInTheDocument();
  });

  it("actualiza la búsqueda al escribir", async () => {
    usersServices.getUsers.mockResolvedValueOnce({ users: [], pagination: { last: 1 } });

    render(
      <MemoryRouter>
        <TutorPage />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/buscar tutor/i);
    await userEvent.type(input, "Ana");

    await waitFor(() => {
      expect(usersServices.getUsers).toHaveBeenCalledWith(1, 20, "Ana", "tutor");
    });
  });

  it("cambia de página con la paginación", async () => {
    usersServices.getUsers.mockResolvedValue({
      users: [],
      pagination: { last: 5 },
    });

    render(
      <MemoryRouter>
        <TutorPage />
      </MemoryRouter>
    );

    const nextPage = await screen.findByRole("button", { name: /2/i });
    await userEvent.click(nextPage);

    await waitFor(() => {
      expect(usersServices.getUsers).toHaveBeenCalledWith(2, 20, "", "tutor");
    });
  });
});