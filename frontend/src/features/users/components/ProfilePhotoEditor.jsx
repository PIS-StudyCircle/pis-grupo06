import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@utils/cropImage";
import { RotateCwSquare } from "lucide-react";

export function ProfilePhotoEditor({ imageSrc, onCancel, onApply }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [rotation, setRotation] = useState(0);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleApply = useCallback(async () => {
    const { fileUrl, file } = await getCroppedImg(
      imageSrc,
      croppedAreaPixels,
      rotation
    );
    onApply(fileUrl, file);
  }, [imageSrc, croppedAreaPixels, rotation, onApply]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#2f3136] text-white rounded-lg p-5 w-[420px] shadow-lg">
        <h2 className="text-lg font-semibold mb-3 text-center">
          Editar imagen
        </h2>

        <div className="relative w-full h-[300px] bg-gray-900 rounded-md overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="mt-5 flex flex-col items-center gap-4">
          {/* Fila 1: Zoom + Rotar */}
          <div className="flex items-center justify-center gap-4 w-full">
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-3/4 accent-indigo-500 cursor-pointer"
            />
            <button
              type="button"
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
              className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition flex items-center justify-center"
            >
              <RotateCwSquare className="w-5 h-5 text-gray-300" />
            </button>
          </div>

          {/* Fila 2: Cancelar / Aplicar */}
          <div className="flex justify-end gap-3 mt-2 w-full">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-1.5 bg-gray-600 hover:bg-gray-700 rounded-md text-sm"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm text-white"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
