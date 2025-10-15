import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import UserProfilePage from "../pages/UserProfilePage";
import * as userService from "../services/usersServices";
import { DEFAULT_PHOTO } from "@/shared/config";
import userEvent from "@testing-library/user-event";

jest.mock("../services/usersServices");

jest.mock('@/shared/config', () => ({
  API_BASE: '/api/v1',
  DEFAULT_PHOTO: 'http://example.com/default-avatar.png'
}));

describe("UserProfile", () => {
  const anaGomez = {
    id: 1,
    name: "Ana",
    last_name: "Gómez",
    email: "ana@example.com",
    photo: null,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRouter = (id) => {
    return render(
      <MemoryRouter initialEntries={[`/usuarios/${id}`]}>
        <Routes>
          <Route path="/usuarios/:id" element={<UserProfilePage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it("muestra loading al inicio", () => {
    userService.getUserById.mockReturnValue(new Promise(() => {}));

    renderWithRouter(1);

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it("muestra el usuario cuando se carga correctamente", async () => {
    userService.getUserById.mockResolvedValue(anaGomez);
    userService.getReviewsByUser.mockResolvedValue([]);
    userService.canReviewUser.mockResolvedValue(false);

    renderWithRouter(1);

    const matches = await screen.findAllByText((_, el) =>
      el?.textContent?.trim() === "Ana Gómez"
    );
    expect(matches.length).toBeGreaterThan(0);

    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
    expect(screen.getByAltText("avatar")).toHaveAttribute("src", DEFAULT_PHOTO);
  });

  it("muestra mensaje de error si la API falla", async () => {
    userService.getUserById.mockRejectedValue(new Error("Error de servidor"));

    renderWithRouter(1);

    expect(await screen.findByText(/error/i)).toHaveTextContent("Error: Error de servidor");
  });

  it("muestra mensaje si no hay usuario", async () => {
    userService.getUserById.mockResolvedValue(null);

    renderWithRouter(999);

    expect(await screen.findByText(/usuario no encontrado/i)).toBeInTheDocument();
  });

  // Reseñas

  it("muestra reseñas si existen", async () => {
    userService.getUserById.mockResolvedValue(anaGomez);
    const reviews = [
      {
        id: 101,
        reviewed_id: 1,
        reviewer_id: 2,
        review: "Excelente tutor",
        created_at: "2025-10-12T10:00:00Z",
        updated_at: "2025-10-12T10:00:00Z",
        reviewer: { id: 2, name: "Carlos", last_name: "Pérez" },
      },
      {
        id: 102,
        reviewed_id: 1,
        reviewer_id: 3,
        review: "Muy clara al explicar",
        created_at: "2025-10-13T14:30:00Z",
        updated_at: "2025-10-13T14:30:00Z",
        reviewer: { id: 3, name: "Lucía", last_name: "Fernández" },
      },
    ];

    userService.getReviewsByUser.mockResolvedValue(reviews);
    userService.canReviewUser.mockResolvedValue(true);

    renderWithRouter(1);

    expect(await screen.findByText("Excelente tutor")).toBeInTheDocument();
    expect(screen.getByText(/Carlos/)).toBeInTheDocument();

    expect(screen.getByText("Muy clara al explicar")).toBeInTheDocument();
    expect(screen.getByText(/Lucía/)).toBeInTheDocument();
  });

  it("muestra mensaje si no hay reseñas", async () => {
    userService.getUserById.mockResolvedValue(anaGomez);

    userService.getReviewsByUser.mockResolvedValue([]);
    userService.canReviewUser.mockResolvedValue(true);

    renderWithRouter(1);

    expect(await screen.findByText(/aún no hay reseñas/i)).toBeInTheDocument();
  });

  it("muestra botón para dejar reseña si puede reseñar", async () => {
    userService.getUserById.mockResolvedValue(anaGomez);

    userService.getReviewsByUser.mockResolvedValue([]);
    userService.canReviewUser.mockResolvedValue(true);

    renderWithRouter(1);

    expect(await screen.findByText(/dejar reseña/i)).toBeInTheDocument();
  });

  it("NO muestra botón para dejar reseña si NO puede reseñar", async () => {
    userService.getUserById.mockResolvedValue(anaGomez);

    userService.getReviewsByUser.mockResolvedValue([]);
    userService.canReviewUser.mockResolvedValue(false);

    renderWithRouter(1);

    expect(screen.queryByText(/dejar reseña/i)).not.toBeInTheDocument();
  });

  it("muestra formulario al hacer clic en 'Dejar reseña'", async () => {
    userService.getUserById.mockResolvedValue(anaGomez);

    userService.getReviewsByUser.mockResolvedValue([]);
    userService.canReviewUser.mockResolvedValue(true);

    renderWithRouter(1);

    const button = await screen.findByRole("button", { name: /dejar reseña/i });
    await userEvent.click(button);
    
    const textarea = await screen.findByPlaceholderText(/escribí tu reseña/i);
    expect(textarea).toBeInTheDocument();
  });

  it("envía reseña y actualiza lista", async () => {
    userService.getUserById.mockResolvedValue(anaGomez);

    const newReview = {
      id: 102,
      reviewed_id: 1,
      reviewer_id: 4,
      review: "Muy buena experiencia",
      created_at: "2025-10-15T00:00:00Z",
      updated_at: "2025-10-15T00:00:00Z",
      reviewer: { id: 4, name: "Luis", last_name: "Martínez" },
    };

    userService.getReviewsByUser
      .mockResolvedValueOnce([]) // antes de enviar
      .mockResolvedValueOnce([newReview]); // después de enviar

    userService.canReviewUser.mockResolvedValue(true);
    userService.createReview.mockResolvedValueOnce({ success: true });

    renderWithRouter(1);

    const button = await screen.findByRole("button", { name: /dejar reseña/i });
    await userEvent.click(button);

    const textarea = await screen.findByPlaceholderText(/escribí tu reseña/i);
    await userEvent.type(textarea, "Muy buena experiencia");

    const submit = screen.getByRole("button", { name: /confirmar/i });
    await userEvent.click(submit);

    expect(await screen.findByText("Muy buena experiencia")).toBeInTheDocument();
    expect(screen.getByText(/Luis/i)).toBeInTheDocument();
  });

  it("muestra todas las reseñas que otros usuarios dejaron si es su propio perfil", async () => {
    userService.getUserById.mockResolvedValue(anaGomez);

    const reviews = [
      {
        id: 301,
        reviewed_id: 1,
        reviewer_id: 2,
        review: "Muy buena tutoría",
        created_at: "2025-10-10T12:00:00Z",
        updated_at: "2025-10-10T12:00:00Z",
        reviewer: { id: 2, name: "Carlos", last_name: "Pérez" },
      },
      {
        id: 302,
        reviewed_id: 1,
        reviewer_id: 3,
        review: "Explicaciones claras",
        created_at: "2025-10-11T15:30:00Z",
        updated_at: "2025-10-11T15:30:00Z",
        reviewer: { id: 3, name: "Lucía", last_name: "Fernández" },
      },
    ];


    userService.getUserById.mockResolvedValue(anaGomez);
    userService.getReviewsByUser.mockResolvedValue(reviews);
    userService.canReviewUser.mockResolvedValue(false);

    renderWithRouter(1);

    // Verifica que se muestran todas las reseñas
    expect(await screen.findByText("Muy buena tutoría")).toBeInTheDocument();
    expect(screen.getByText("Explicaciones claras")).toBeInTheDocument();

    // Verifica que aparecen los nombres de los reviewers
    expect(screen.getByText(/Carlos/)).toBeInTheDocument();
    expect(screen.getByText(/Lucía/)).toBeInTheDocument();

    // Verifica que no aparece el botón para dejar reseña
    expect(screen.queryByText(/dejar reseña/i)).not.toBeInTheDocument();

  });

});