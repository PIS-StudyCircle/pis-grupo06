import { useState, useEffect } from "react";
import { useUser } from "@context/UserContext";
import { useNavigate } from "react-router-dom";
import { useFormSubmit } from "@utils/UseFormSubmit";
import { useFormState } from "@utils/UseFormState";
import { updateProfile } from "../services/usersServices";
import { Input } from "@/shared/components/Input";
import { Textarea } from "@/shared/components/Textarea";
import { SubmitButton } from "@/shared/components/SubmitButton";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import { ProfilePhotoEditor } from "../components/ProfilePhotoEditor";
import { DEFAULT_PHOTO } from "@/shared/config";
import { ArrowLeft } from "lucide-react";

export default function EditProfilePage() {
  const { user, updateUser } = useUser();
  const navigate = useNavigate();

  const { form, setField } = useFormState({
    name: "",
    last_name: "",
    description: "",
    profile_photo: null,
  });

  const [showEditor, setShowEditor] = useState(false);
  const [preview, setPreview] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);

  const { error, onSubmit } = useFormSubmit(
    async (formData) => {
      const updatedUser = await updateProfile(formData, user.id);
      if (updatedUser) {
        updateUser(updatedUser);
      }
    },
    "/perfil"
  );

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setField("name", user.name || "");
      setField("last_name", user.last_name || "");
      setField("description", user.description || "");
      setField("profile_photo", null);
      setPreview(user.profile_photo_url || DEFAULT_PHOTO);
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      setShowEditor(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  if (!user) {
    return <p className="text-center mt-10">No hay usuario cargado.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-2xl p-4 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/perfil")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al perfil
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Editar perfil</h1>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 gap-y-6 flex flex-col">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <img
                  src={preview}
                  alt="Profile preview"
                  className="w-24 h-24 rounded-full border-4 border-gray-200 shadow-md object-cover"
                />
              </div>

              <Input
                id="profile_photo"
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                label="Foto de perfil"
              />
            </div>

            {/* Email (disabled) */}
            <Input
              id="email"
              type="email"
              value={user.email}
              readOnly={true}
              disabled
              label="Email"
              className="bg-gray-100 cursor-not-allowed"
            />

            {/* Name */}
            <Input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Nombre"
              label="Nombre"
              required
              // error={errors.name} agregar esto cuando agregue el useValidator
            />

            {/* Last Name */}
            <Input
              id="last_name"
              type="text"
              value={form.last_name}
              onChange={(e) => setField("last_name", e.target.value)}
              placeholder="Apellido"
              label="Apellido"
              required
              // error={errors.last_name}
            />

            {/* Description */}
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Descripción personal (opcional)"
              label="Descripción"
              className="resize-none"
            />

            {/* Errores del backend */}
            {error.length > 0 && (
              <ErrorAlert>
                {error.map((err, idx) => (
                  <p key={idx}>{err}</p>
                ))}
              </ErrorAlert>
            )}

            {/* Submit Button */}
            <SubmitButton text="Guardar cambios" />
          </form>
        </div>

        {/* Profile Photo Editor Modal */}
        {showEditor && fileUrl && (
          <ProfilePhotoEditor
            imageSrc={fileUrl}
            onCancel={() => {
              setShowEditor(false);
              setFileUrl(null);
            }}
            onApply={(croppedUrl, croppedFile) => {
              setPreview(croppedUrl);
              setField("profile_photo", croppedFile);
              setShowEditor(false);
              setFileUrl(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
