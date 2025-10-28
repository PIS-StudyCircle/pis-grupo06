import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DEFAULT_PHOTO } from "@/shared/config";
import userEvent from "@testing-library/user-event";
import UserListPage from "../pages/UserListPage";
import * as usersServices from "../services/usersServices";
import { act } from "react";

jest.mock("../services/usersServices");

jest.mock("@/shared/config", () => ({
  API_BASE: "/api/v1",
  DEFAULT_PHOTO: "http://example.com/default-avatar.png",
}));

async function renderUserListPage() {
  await act(async () => {
    render(
      <MemoryRouter>
        <UserListPage />
      </MemoryRouter>
    );
  });
}


describe("UserListPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("muestra loading", async () => {
    let resolve;
    const promise = new Promise(r => (resolve = r));
    usersServices.getUsers.mockReturnValueOnce(promise);

    render(<UserListPage />);

    // Ahora el skeleton debe estar visible
    expect(screen.getAllByRole("progressbar")[0]).toBeInTheDocument();
    // Resolvemos la promesa para que el componente termine
    await act(async () => {
      resolve({ users: [], pagination: {} });
    });
  });

  it("muestra mensaje de error", async () => {
    usersServices.getUsers.mockRejectedValueOnce(
      new Error("Error al cargar los usuarios")
    );

    await act(async () => {
      render(<UserListPage />);
    });

    expect(
      await screen.findByText(/Error al cargar los usuarios/i)
    ).toBeInTheDocument();
  });

  it("muestra la lista de usuarios con sus imágenes o iniciales", async () => {
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

    await renderUserListPage();

    expect(await screen.findByText("Juan Pérez")).toBeInTheDocument();
    expect(await screen.findByText("Ana Gómez")).toBeInTheDocument();

    expect(screen.getByAltText("Juan Pérez")).toHaveAttribute(
      "src",
      "http://example.com/photo.jpg"
    );
    expect(screen.getByAltText("Ana Gómez")).toHaveAttribute("src", DEFAULT_PHOTO);
  });

  it("muestra solo tutores cuando el checkbox está marcado", async () => {
    const allUsers = [
      { id: 1, name: "Juan", last_name: "Pérez", email: "juan@example.com" },
      { id: 2, name: "Ana", last_name: "Gómez", email: "ana@example.com" },
    ];

    const tutorUsers = [
      { id: 1, name: "Juan", last_name: "Pérez", email: "juan@example.com" },
    ];

    // Mock que devuelve distintos usuarios según el rol
    usersServices.getUsers.mockImplementation((page, perPage, search, role) => {
      if (role === "tutor") {
        return Promise.resolve({ users: tutorUsers, pagination: { last: 1 } });
      }
      return Promise.resolve({ users: allUsers, pagination: { last: 1 } });
    });

    // Renderizar la página
    await renderUserListPage();

    // Comprobar que los usuarios iniciales aparecen
    expect(await screen.findByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("Ana Gómez")).toBeInTheDocument();

    // Hacer click en "Solo tutores"
    const checkbox = screen.getByLabelText(/Solo tutores/i);
    await act(async () => {
      await userEvent.click(checkbox);
    });

    // Ahora solo Juan debería estar
    expect(await screen.findByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.queryByText("Ana Gómez")).not.toBeInTheDocument();
  });

  it("muestra todos los usuarios cuando el checkbox está desmarcado", async () => {
    const usuarios = [
      { id: 1, name: "Juan", last_name: "Pérez", email: "juan@example.com" },
      { id: 2, name: "Ana", last_name: "Gómez", email: "ana@example.com" },
    ];

    usersServices.getUsers.mockResolvedValueOnce({
      users: usuarios,
      pagination: { last: 1 },
    });

    await renderUserListPage();

    await waitFor(() => {
      expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
      expect(screen.getByText("Ana Gómez")).toBeInTheDocument();
    });
  });

  it("muestra mensaje cuando no hay usuarios", async () => {
    usersServices.getUsers.mockResolvedValueOnce({
      users: [],
      pagination: { last: 1 },
    });

    await renderUserListPage();

    expect(await screen.findByText(/No hay usuarios disponibles./i)).toBeInTheDocument();
  });

  it("actualiza la búsqueda al escribir con el checkbox de tutores marcado, y muestra solo tutores que coinciden", async () => {
    const usuarios = [
      { id: 1, name: "Ana", last_name: "Gómez", email: "ana@example.com", role: "tutor" },
      { id: 2, name: "Andrés", last_name: "López", email: "andres@example.com", role: "tutor" },
      { id: 3, name: "Carlos", last_name: "Pérez", email: "carlos@example.com", role: "" },
    ];

    // Primer fetch: todos los usuarios
    usersServices.getUsers.mockResolvedValueOnce({
      users: usuarios,
      pagination: { last: 1 },
    });

    await renderUserListPage();

    // Marcar checkbox "Solo tutores"
    const checkbox = screen.getByLabelText(/Solo tutores/i);
    await act(async () => {
      await userEvent.click(checkbox);
    });

    // Segundo fetch: solo tutores que coinciden con búsqueda
    usersServices.getUsers.mockResolvedValueOnce({
      users: [usuarios[0]], // Ana Gómez
      pagination: { last: 1 },
    });

    // Cambiar búsqueda a "Ana"
    const searchInput = screen.getByPlaceholderText(/Buscar usuario/i);
    await act(async () => {
      await userEvent.type(searchInput, "Ana");
    });

    // Esperar que no aparezca mensaje de error
    await waitFor(() =>
      expect(
        screen.queryByText(/No hay tutores disponibles|Error al cargar los usuarios/i)
      ).not.toBeInTheDocument()
    );

    // Verificar que Ana aparece
    const anaEmail = await screen.findByText(/ana@example\.com/i);
    expect(anaEmail).toBeInTheDocument();

    const anaName = await screen.findByText(/Ana\s+Gómez/i); // regex flexible con espacios
    expect(anaName).toBeInTheDocument();

    // Verificar que otros usuarios no aparecen
    expect(screen.queryByText(/Andrés\s+López/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Carlos\s+Pérez/i)).not.toBeInTheDocument();
  });


  it("actualiza la búsqueda al escribir con el checkbox de solo tutores desmarcado", async () => {
    usersServices.getUsers.mockResolvedValueOnce({ users: [], pagination: { last: 1 } });

    await renderUserListPage();

    const input = screen.getByPlaceholderText(/buscar usuario/i);

    await act(async () => {
      await userEvent.type(input, "Ana");
    });

    await waitFor(() => {
      expect(usersServices.getUsers).toHaveBeenCalledWith(1, 20, "Ana", "");
    });
  });

  it("cambia de página con la paginación", async () => {
    usersServices.getUsers.mockResolvedValue({
      users: [],
      pagination: { last: 5 },
    });

    await renderUserListPage();

    const nextPage = await screen.findByRole("button", { name: /2/i });
    await act(async () => {
      await userEvent.click(nextPage);
    });

    await waitFor(() => {
      expect(usersServices.getUsers).toHaveBeenCalledWith(2, 20, "", "");
    });
  });

  it("filtra solo tutores al activar el checkbox", async () => {
    usersServices.getUsers.mockResolvedValueOnce({
      users: [],
      pagination: { last: 1 },
    });

    await renderUserListPage();

    const checkbox = screen.getByLabelText(/Solo tutores/i);
    await act(async () => {
      await userEvent.click(checkbox);
    });

    await waitFor(() => {
      expect(usersServices.getUsers).toHaveBeenCalledWith(1, 20, "", "tutor");
    });
  });
});
