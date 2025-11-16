import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import UserProfilePage from "../pages/UserProfilePage";
import { useUser } from "@context/UserContext";
import { getFeedbacks } from "../services/feedbackServices";
import { useBadges } from "@features/users/hooks/useInsignas";

// --- Mocks ---
jest.mock("@context/UserContext");
jest.mock("../services/usersServices", () => ({
  getUserById: jest.fn(),
  canReviewUser: jest.fn(),
  createReview: jest.fn(),
  getReviewsByUser: jest.fn(),
  updateReview: jest.fn(),
  deleteReview: jest.fn(),
}));
jest.mock("../hooks/useUserReviews", () => ({
  useUserReviews: jest.fn(),
}));
jest.mock("../services/feedbackServices", () => ({
  getFeedbacks: jest.fn(),
}));
jest.mock("@/features/users/hooks/useInsignas", () => ({
  useBadges: jest.fn(),
}));

// --- Imports reales de los mocks ---
import {
  getUserById,
  canReviewUser,
  createReview,
  getReviewsByUser,
} from "../services/usersServices";
import { useUserReviews } from "../hooks/useUserReviews";

// --- Datos de prueba ---
const mockUser = {
  id: 1,
  name: "Ana",
  last_name: "Laura",
  email: "ana@example.com",
  description: "Amante de los gatos",
  profile_photo_url: null,
};

const mockReviews = [
  {
    id: 10,
    review: "Excelente tutora",
    reviewer: { id: 2, name: "Carlos", last_name: "Pérez", email: "carlos@example.com" },
  },
];

// --- Helper para renderizar ---
const setup = async (id = 1) => {
  await act(async () => {
    render(
      <MemoryRouter initialEntries={[`/usuarios/${id}`]}>
        <Routes>
          <Route path="/usuarios/:id" element={<UserProfilePage />} />
        </Routes>
      </MemoryRouter>
    );
  });
};

describe("UserProfilePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock global de useUser
    useUser.mockReturnValue({
      user: { id: 99, name: "Tester" },
      setUser: jest.fn(),
    });

    // Mock global de useBadges para prevenir undefined
    useBadges.mockReturnValue({
      tutorias_dadas: null,
      tutorias_recibidas: null,
      resenas_dadas: null,
      feedback_dado: null,
    });
  });

  it("muestra los datos del usuario y las reseñas", async () => {
    getUserById.mockResolvedValueOnce(mockUser);
    canReviewUser.mockResolvedValueOnce(false);
    getReviewsByUser.mockResolvedValueOnce(mockReviews);
    getFeedbacks.mockResolvedValueOnce({ average_rating: 4.5, total_feedbacks: 10 });
    useUserReviews.mockReturnValue({
      reviews: mockReviews,
      loading: false,
      error: null,
      setReviews: jest.fn(),
    });

    await setup(1);

    expect(await screen.findByText("Ana Laura")).toBeInTheDocument();
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
    expect(screen.getByText("Amante de los gatos")).toBeInTheDocument();

    // Reseñas
    expect(screen.getByText("Excelente tutora")).toBeInTheDocument();
    expect(screen.getByText(/Carlos Pérez/)).toBeInTheDocument();
  });

  it("permite dejar una reseña si canReview es true", async () => {
    getUserById.mockResolvedValueOnce(mockUser);
    canReviewUser.mockResolvedValueOnce(true);
    getReviewsByUser.mockResolvedValueOnce([]);
    useUserReviews.mockReturnValue({
      reviews: [],
      loading: false,
      error: null,
      setReviews: jest.fn(),
    });

    await setup(1);

    const leaveReviewBtn = await screen.findByText("Dejar reseña");
    fireEvent.click(leaveReviewBtn);

    const textarea = screen.getByPlaceholderText("Escribí tu reseña...");
    fireEvent.change(textarea, { target: { value: "Muy buena tutora" } });

    const confirmBtn = screen.getByText("Confirmar");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(createReview).toHaveBeenCalledWith(expect.anything(), "Muy buena tutora");
    });
  });

  it("muestra mensaje de error si falla la carga", async () => {
    getUserById.mockRejectedValueOnce(new Error("Error de servidor"));
    canReviewUser.mockResolvedValueOnce(false);
    useUserReviews.mockReturnValue({
      reviews: [],
      loading: false,
      error: null,
      setReviews: jest.fn(),
    });

    await setup(1);

    expect(await screen.findByText(/Error: Error de servidor/)).toBeInTheDocument();
  });

  it("no muestra insignias si todos los valores son 0", async () => {
    getUserById.mockResolvedValueOnce({
      ...mockUser,
      tutorias_dadas: 0,
      tutorias_recibidas: 0,
      resenas_dadas: 0,
      feedback_dado: 0,
    });
    useBadges.mockReturnValue({
      tutorias_dadas: "/badge1.png",
      tutorias_recibidas: "/badge2.png",
      resenas_dadas: "/badge3.png",
      feedback_dado: "/badge4.png",
    });

    await setup(1);

    expect(screen.queryByAltText("Tutorías dadas")).not.toBeInTheDocument();
    expect(screen.queryByAltText("Tutorías recibidas")).not.toBeInTheDocument();
    expect(screen.queryByAltText("Reseñas dadas")).not.toBeInTheDocument();
    expect(screen.queryByAltText("Feedback dado")).not.toBeInTheDocument();
  });

  it("muestra las insignias correctas cuando los valores son mayores a 0", async () => {
    getUserById.mockResolvedValueOnce({
      ...mockUser,
      tutorias_dadas: 3,
      tutorias_recibidas: 1,
      resenas_dadas: 2,
      feedback_dado: 4,
    });
    useBadges.mockReturnValue({
      tutorias_dadas: "/tutorias_dadas.png",
      tutorias_recibidas: "/tutorias_recibidas.png",
      resenas_dadas: "/resenas_dadas.png",
      feedback_dado: "/feedback_dado.png",
    });

    await setup(1);

    expect(screen.getByAltText("Tutorías dadas")).toBeInTheDocument();
    expect(screen.getByAltText("Tutorías recibidas")).toBeInTheDocument();
    expect(screen.getByAltText("Reseñas dadas")).toBeInTheDocument();
    expect(screen.getByAltText("Feedback dado")).toBeInTheDocument();
  });

  it("solo muestra insignias con valores > 0", async () => {
    getUserById.mockResolvedValueOnce({
      ...mockUser,
      tutorias_dadas: 1,
      tutorias_recibidas: 0,
      resenas_dadas: 2,
      feedback_dado: 0,
    });
    useBadges.mockReturnValue({
      tutorias_dadas: "/tutorias_dadas.png",
      tutorias_recibidas: "/tutorias_recibidas.png",
      resenas_dadas: "/resenas_dadas.png",
      feedback_dado: "/feedback_dado.png",
    });

    await setup(1);

    expect(screen.getByAltText("Tutorías dadas")).toBeInTheDocument();
    expect(screen.getByAltText("Reseñas dadas")).toBeInTheDocument();
    expect(screen.queryByAltText("Tutorías recibidas")).not.toBeInTheDocument();
    expect(screen.queryByAltText("Feedback dado")).not.toBeInTheDocument();
  });
});