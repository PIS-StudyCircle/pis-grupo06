import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import UserProfilePage from "../pages/UserProfilePage";
import { useUser } from "@context/UserContext";
import { getFeedbacks } from "../services/feedbackServices";

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
    useUser.mockReturnValue({
      user: { id: 99, name: "Tester" },
      setUser: jest.fn(),
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
});
