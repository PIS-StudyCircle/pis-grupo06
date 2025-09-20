import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DeleteAccountButton from "@/features/users/pages/DeleteAccountButton";
import { UserContext } from "@/shared/context/UserContext";
import { BrowserRouter } from "react-router-dom";

// Mock signOut y navigate
const mockSignOut = jest.fn();
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("DeleteAccountButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock fetch global
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: "Cuenta eliminada con éxito" }),
      })
    );
  });

  function renderWithContext() {
    return render(
      <UserContext.Provider value={{ signOut: mockSignOut }}>
        <BrowserRouter>
          <DeleteAccountButton />
        </BrowserRouter>
      </UserContext.Provider>
    );
  }

  it("muestra el botón y el mensaje de confirmación", () => {
    renderWithContext();
    expect(screen.getByText("Eliminar cuenta")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Eliminar cuenta"));
    expect(screen.getByText(/¿Estás seguro/)).toBeInTheDocument();
    expect(screen.getByText("Sí, eliminar")).toBeInTheDocument();
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  it("llama a fetch, signOut y navega al eliminar", async () => {
    renderWithContext();
    fireEvent.click(screen.getByText("Eliminar cuenta"));
    fireEvent.click(screen.getByText("Sí, eliminar"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/v1/users",
        expect.objectContaining({ method: "DELETE", credentials: "include" })
      );
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/iniciar_sesion");
    });
  });

  it("muestra alerta si hay error", async () => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: false }));
    window.alert = jest.fn();

    renderWithContext();
    fireEvent.click(screen.getByText("Eliminar cuenta"));
    fireEvent.click(screen.getByText("Sí, eliminar"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Error al eliminar la cuenta");
    });
  });
});