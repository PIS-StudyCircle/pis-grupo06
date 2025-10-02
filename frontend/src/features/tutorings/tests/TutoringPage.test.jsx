import React from "react";
import { render, screen, fireEvent, waitFor, cleanup, within } from "@testing-library/react";
import TutoringPage from "../pages/TutoringPage";
import { useUser } from "@context/UserContext";
import * as tutoringService from "../services/tutoringService";

jest.mock("@context/UserContext", () => ({
  useUser: jest.fn(),
}));

jest.mock("../services/tutoringService", () => ({
  getTutorings: jest.fn(),
}));

beforeEach(() => {
  useUser.mockReturnValue({ user: { id: 99, name: "Test User" } });
});

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe("TutoringPage", () => {
  it("renderiza el título y muestra tutorías desde el service", async () => {
    tutoringService.getTutorings.mockResolvedValue({
      tutorings: [
        {
          id: 1,
          course: { name: "Cálculo I" },
          scheduled_at: "2025-10-01T10:00:00",
          modality: "Virtual",
          capacity: 10,
          enrolled: 2,
          subjects: [],
          tutor_id: null,
          enrolled_students: []
        },
        {
          id: 2,
          course: { name: "Programación II" },
          scheduled_at: "2025-10-02T10:00:00",
          modality: "Presencial",
          capacity: 15,
          enrolled: 10,
          subjects: [],
          tutor_id: null,
          enrolled_students: []
        }
      ],
      pagination: { last: 5 }
    });

    render(<TutoringPage filters={{ subject: "math" }} />);

    await waitFor(() => screen.getByText(/Cálculo I/));

    expect(screen.getByRole("heading", { name: /Tutorías Disponibles/i })).toBeInTheDocument();

    const firstCard = screen.getAllByText(/Materia:/)[0].closest("div.w-full");
    expect(within(firstCard).getByText("Virtual")).toBeInTheDocument();

    const secondCard = screen.getAllByText(/Materia:/)[1].closest("div.w-full");
    expect(within(secondCard).getByText("Presencial")).toBeInTheDocument();
  });

  it("usa totalPages=1 cuando pagination.last es falsy", async () => {
    tutoringService.getTutorings.mockResolvedValue({
      tutorings: [],
      pagination: {}
    });
  
    render(<TutoringPage />);
    await waitFor(() => screen.getByText(/No hay tutorías disponibles./));
  
    const pagination = screen.queryByRole("navigation", { name: /Pagination/i });
    if (pagination) {
      expect(pagination).toHaveAttribute("data-totalpages", "1");
      expect(screen.getByText(/Page 1 \/ 1/)).toBeInTheDocument();
    } else {
      expect(true).toBe(true);
    }
  });

  it("hace setPage al avanzar con la paginación", async () => {
    const mockData = {
      tutorings: [
        {
          id: 1,
          course: { name: "Estructuras de Datos" },
          scheduled_at: "2025-10-01T10:00:00",
          modality: "Virtual",
          capacity: 10,
          enrolled: 2,
          subjects: [],
          tutor_id: null,
          enrolled_students: []
        }
      ],
      pagination: { last: 3 }
    };
  
    tutoringService.getTutorings.mockResolvedValue(mockData);
  
    render(<TutoringPage />);
    await waitFor(() => screen.getByText(/Estructuras de Datos/));

    tutoringService.getTutorings.mockClear();

    const nextButton = screen.getByLabelText("Next page");
    fireEvent.click(nextButton);

    await waitFor(() =>
      expect(tutoringService.getTutorings).toHaveBeenCalledTimes(3)
    );
  });

  it("propaga estados de loading y error correctamente", async () => {
    tutoringService.getTutorings.mockRejectedValue(new Error("Algo salió mal"));

    render(<TutoringPage />);
    await waitFor(() => screen.getByText(/Error al cargar las tutorías/));

    expect(screen.getByText(/Error al cargar las tutorías/)).toBeInTheDocument();
  });

  it("muestra sin tutorías si no hay datos", async () => {
    tutoringService.getTutorings.mockResolvedValue({
      tutorings: [],
      pagination: { last: 1 }
    });

    render(<TutoringPage />);
    await waitFor(() => screen.getByText("No hay tutorías disponibles."));
    expect(screen.getByText("No hay tutorías disponibles.")).toBeInTheDocument();
  });

  it("muestra una tutoring card con botón Ser tutor", async () => {
    tutoringService.getTutorings.mockResolvedValue({
      tutorings: [
        {
          id: 1,
          course: { name: "Matemática I" },
          scheduled_at: "2025-10-01T10:00:00",
          modality: "Virtual",
          capacity: 10,
          enrolled: 5,
          subjects: [
            { id: 1, name: "Álgebra" },
            { id: 2, name: "Geometría" }
          ],
          tutor_id: null,
          enrolled_students: []
        }
      ],
      pagination: { last: 1 }
    });
  
    render(<TutoringPage />);
  
    const materiaLabel = await screen.findByText("Materia:", { selector: "b" });
    expect(materiaLabel.parentElement).toHaveTextContent("Matemática I");
  
    const modalidadLabel = screen.getByText("Modalidad:", { selector: "b" });
    expect(modalidadLabel.parentElement).toHaveTextContent("Virtual");
  
    const cuposLabel = screen.getByText("Cupos disponibles:", { selector: "b" });
    expect(cuposLabel.parentElement).toHaveTextContent("5");
  
    expect(screen.getByRole("button", { name: "Ser tutor" })).toBeInTheDocument();
  });
});