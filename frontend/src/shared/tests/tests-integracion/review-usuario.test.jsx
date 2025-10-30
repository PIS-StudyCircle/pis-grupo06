import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import UserProfile from "../../../features/users/pages/UserProfilePage";


// mock de los servicios
jest.mock("../../../features/users/services/usersServices", () => ({
  getUserById: jest.fn(),
  canReviewUser: jest.fn(),
  createReview: jest.fn(),
  getReviewsByUser: jest.fn(),
}));

// mock de toastService (para que no rompa)
jest.mock("@shared/utils/toastService", () => ({
  showError: jest.fn(),
}));

jest.mock("../../../shared/context/UserContext", () => ({
  useUser: () => ({ user: { id: 999, name: "Test", last_name: "User" } }),
}));
jest.mock("../../../features/users/services/feedbackServices", () => ({
  getFeedbacks: jest.fn(),
}));
import { getFeedbacks } from "../../../features/users/services/feedbackServices";

import {
  getUserById,
  canReviewUser,
  createReview,
  getReviewsByUser,
} from "../../../features/users/services/usersServices";

describe("UserProfile", () => {
  const mockUser = {
    id: 1,
    name: "Ana",
    last_name: "Perez",
    email: "ana@example.com",
    description: "usuario de ejemplo",
    profile_photo_url: null,
  };

  const mockReviews = [
    { id: 1, reviewer: "Ana", review: "Excelente!" },
    { id: 2, reviewer: "Juan", review: "Muy responsable" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function renderWithRouter(initialPath = "/users/1") {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/users/:id" element={<UserProfile />} />
        </Routes>
      </MemoryRouter>
    );
  }

  test("muestra la info del usuario y las reseñas", async () => {
    getUserById.mockResolvedValueOnce(mockUser);
    canReviewUser.mockResolvedValueOnce(false);
    getReviewsByUser.mockResolvedValueOnce(mockReviews);
    getFeedbacks.mockResolvedValueOnce({ average_rating: 4.5, total_feedbacks: 10 });

    renderWithRouter();

    expect(await screen.findByText(/ana perez/i)).toBeInTheDocument();
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
    expect(screen.getByText("usuario de ejemplo")).toBeInTheDocument();

    // Reseñas cargadas
    expect(await screen.findByText("Excelente!")).toBeInTheDocument();
    expect(screen.getByText("Muy responsable")).toBeInTheDocument();

    // No debe estar el botón para dejar reseña
    expect(
      screen.queryByRole("button", { name: /dejar reseña/i })
    ).not.toBeInTheDocument();
  });

  test("permite dejar una reseña cuando canReviewUser = true", async () => {
    getUserById.mockResolvedValueOnce(mockUser);
    canReviewUser.mockResolvedValueOnce(true);
    getReviewsByUser.mockResolvedValueOnce(mockReviews);
    createReview.mockResolvedValueOnce({});

    // Después de enviar reseña, se refrescan datos
    getReviewsByUser.mockResolvedValueOnce([
      ...mockReviews,
      { id: 3, reviewer: "Tú", review: "Genial trabajar con ella" },
    ]);
    canReviewUser.mockResolvedValueOnce(false);

    renderWithRouter();

    // Esperar que cargue el perfil
    expect(await screen.findByText("Excelente!")).toBeInTheDocument();

    // Botón para dejar reseña visible
    const btnDejarResena = screen.getByRole("button", { name: /dejar reseña/i });
    await userEvent.click(btnDejarResena);

    // Se muestra el formulario
    const textarea = screen.getByPlaceholderText(/escribí tu reseña/i);
    await userEvent.type(textarea, "Genial trabajar con ella");

    // Enviar
    await userEvent.click(screen.getByRole("button", { name: /confirmar/i }));

    // Verificamos que se haya llamado al servicio
    await waitFor(() => {
      expect(createReview).toHaveBeenCalledWith("1", "Genial trabajar con ella");
    });

    // Aparece la nueva reseña
    expect(await screen.findByText("Genial trabajar con ella")).toBeInTheDocument();
  });

  test("muestra error si falla la carga del usuario", async () => {
    getUserById.mockRejectedValueOnce(new Error("No encontrado"));
    canReviewUser.mockResolvedValueOnce(false);
    getReviewsByUser.mockResolvedValueOnce([]);

    renderWithRouter();

    expect(await screen.findByText(/error/i)).toHaveTextContent("No encontrado");
  });
});
