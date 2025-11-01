import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import TopTutors from "@/features/courses/components/TopTutors";

jest.mock("@/features/users/services/feedbackServices", () => ({
  getTopRatedTutors: jest.fn(),
}));

import { getTopRatedTutors } from "@/features/users/services/feedbackServices";

describe("TopTutors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("muestra estado de carga inicialmente", () => {
    getTopRatedTutors.mockResolvedValueOnce([]);
    render(<TopTutors />);
    expect(screen.getByText(/Cargando ranking/i)).toBeInTheDocument();
  });

  test("muestra mensaje vacío cuando no hay tutores", async () => {
    getTopRatedTutors.mockResolvedValueOnce([]);
    render(<TopTutors />);

    await waitFor(() =>
      expect(
        screen.getByText(/Todavía no hay tutores puntuados/i)
      ).toBeInTheDocument()
    );

    expect(getTopRatedTutors).toHaveBeenCalledTimes(1);
  });

  test("renderiza top 3 con medallas y resto con posición numérica", async () => {
    getTopRatedTutors.mockResolvedValueOnce([
      { id: 1, name: "Ana",   email: "ana@mail.com",   average_rating: 4.9, total_feedbacks: 25 },
      { id: 2, name: "Bruno", email: "bruno@mail.com", average_rating: 4.8, total_feedbacks: 20 },
      { id: 3, name: "Carla", email: "carla@mail.com", average_rating: 4.7, total_feedbacks: 18 },
      { id: 4, name: "Diego", email: "diego@mail.com", average_rating: 4.6, total_feedbacks: 10 },
    ]);

    render(<TopTutors />);
    await screen.findByText(/Mejores Tutores/i);

    // Top 3 con medallas y prefijo "n. Nombre"
    expect(screen.getByText("🥇")).toBeInTheDocument();
    expect(screen.getByText("🥈")).toBeInTheDocument();
    expect(screen.getByText("🥉")).toBeInTheDocument();

    expect(screen.getByText("1. Ana")).toBeInTheDocument();
    expect(screen.getByText("2. Bruno")).toBeInTheDocument();
    expect(screen.getByText("3. Carla")).toBeInTheDocument();

    // El 4° sin medalla y con "4. Nombre"
    expect(screen.getByText("4.")).toBeInTheDocument();
    expect(screen.getByText("Diego")).toBeInTheDocument();

    expect(screen.getAllByText("⭐").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("(25)")).toBeInTheDocument();
    expect(screen.getByText("(20)")).toBeInTheDocument();
    expect(screen.getByText("(18)")).toBeInTheDocument();
    expect(screen.getByText("(10)")).toBeInTheDocument();

    expect(getTopRatedTutors).toHaveBeenCalledTimes(1);
  });

  test("muestra el error cuando el servicio rechaza", async () => {
    getTopRatedTutors.mockRejectedValueOnce(new Error("Falla API"));
    render(<TopTutors />);

    await waitFor(() =>
      expect(screen.getByText(/Falla API/i)).toBeInTheDocument()
    );
  });
});
