import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import TopTutors from "@/features/courses/components/TopTutors";

jest.mock("@/features/users/services/feedbackServices", () => ({
  getTopRatedTutors: jest.fn(),
}));

jest.mock("@context/UserContext", () => ({ useUser: jest.fn() }));

import { getTopRatedTutors } from "@/features/users/services/feedbackServices";
import { useUser } from "@context/UserContext";

describe("TopTutors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useUser.mockReturnValue({ user: { id: 1 } });
  });

  test("no muestra el estado de carga si no está logueado", () => {
    useUser.mockReturnValue({ user: null });
    render(<TopTutors />);
    expect(screen.queryByText(/Cargando ranking/i)).not.toBeInTheDocument();
  });

  test("muestra estado de carga inicialmente", () => {
    getTopRatedTutors.mockResolvedValueOnce([]);
    const { container } = render(<TopTutors />);
    // el componente renderiza 5 skeletons durante la carga (li con clase animate-pulse)
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThanOrEqual(5);
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
      { id: 1, name: "Ana",   last_name: "Lopez",   email: "ana@mail.com",   average_rating: 4.9, total_feedbacks: 25 },
      { id: 2, name: "Bruno", last_name: "Perez",   email: "bruno@mail.com", average_rating: 4.8, total_feedbacks: 20 },
      { id: 3, name: "Carla", last_name: "Gomez",   email: "carla@mail.com", average_rating: 4.7, total_feedbacks: 18 },
      { id: 4, name: "Diego", last_name: "Soto",    email: "diego@mail.com", average_rating: 4.6, total_feedbacks: 10 },
    ]);

    const { container } = render(<TopTutors />);
    // esperar que alguno de los nombres aparezca
    await screen.findByText(/Ana/i);

    // los nombres deben estar en el documento (buscar nombre + apellido)
    expect(screen.getByText(/Ana\s+Lopez/)).toBeInTheDocument();
    expect(screen.getByText(/Bruno\s+Perez/)).toBeInTheDocument();
    expect(screen.getByText(/Carla\s+Gomez/)).toBeInTheDocument();
    expect(screen.getByText(/Diego\s+Soto/)).toBeInTheDocument();

    // los primeros 3 items usan la clase aplicada a top3 (rounded-lg ... shadow-inner)
    const items = container.querySelectorAll("ul > li");
    expect(items.length).toBeGreaterThanOrEqual(4);
    expect(items[0].className).toMatch(/rounded-lg/);
    expect(items[1].className).toMatch(/rounded-lg/);
    expect(items[2].className).toMatch(/rounded-lg/);
    // el 4° no debe tener la clase de top3
    expect(items[3].className).not.toMatch(/rounded-lg/);

    // el 4° muestra prefijo numérico "4."
    // comprobar dentro del 4º ítem para evitar splits de nodos/espacios nuevos
    expect(items[3]).toHaveTextContent(/^\s*4\s*\./);

    // estrellas y counts
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
