import { render, screen, fireEvent } from "@testing-library/react";
import { ProfilePhotoEditor } from "../components/ProfilePhotoEditor";
import { getCroppedImg } from "@utils/cropImage";
import { RotateCwSquare } from "lucide-react";

jest.mock("@utils/cropImage", () => ({
  getCroppedImg: jest.fn(),
}));

describe("ProfilePhotoEditor", () => {
  const imageSrc = "mock-image.jpg";
  const onCancel = jest.fn();
  const onApply = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    getCroppedImg.mockResolvedValue({
      fileUrl: "blob:mock",
      file: new File(["mock"], "photo.png", { type: "image/png" }),
    });
  });

  it("renderiza con la imagen", () => {
    render(<ProfilePhotoEditor imageSrc={imageSrc} onCancel={onCancel} onApply={onApply} />);
    expect(screen.getByText(/Editar imagen/i)).toBeInTheDocument();
    const applyButton = screen.getByText(/Aplicar/i);
    expect(applyButton).toBeInTheDocument();
  });

  it("llama a onCancel al clickear cancelar", () => {
    render(<ProfilePhotoEditor imageSrc={imageSrc} onCancel={onCancel} onApply={onApply} />);
    fireEvent.click(screen.getByText(/Cancelar/i));
    expect(onCancel).toHaveBeenCalled();
  });

  it("llama a onApply con el archivo recortado", async () => {
    render(<ProfilePhotoEditor imageSrc={imageSrc} onCancel={onCancel} onApply={onApply} />);
    fireEvent.click(screen.getByText(/Aplicar/i));
    // Esperar a que la promesa de getCroppedImg se resuelva
    await Promise.resolve();
    expect(getCroppedImg).toHaveBeenCalledWith(expect.any(String), expect.any(Object), expect.any(Number));
    expect(onApply).toHaveBeenCalledWith("blob:mock", expect.any(File));
  });

  it("cambia la rotación al clickear el botón de rotar", () => {
    render(<ProfilePhotoEditor imageSrc={imageSrc} onCancel={onCancel} onApply={onApply} />);
    const rotateButton = screen.getByRole("button", { name: "" });
    fireEvent.click(rotateButton);
    fireEvent.click(rotateButton);
  });

  it("cambia zoom al mover el input range", () => {
    render(<ProfilePhotoEditor imageSrc={imageSrc} onCancel={onCancel} onApply={onApply} />);
    const zoomInput = screen.getByRole("slider");
    fireEvent.change(zoomInput, { target: { value: 2 } });
    expect(zoomInput.value).toBe("2");
  });
});