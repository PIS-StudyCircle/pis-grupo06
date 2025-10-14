import { useState } from "react";
import { useUser } from "@context/UserContext";
import { AuthLayout } from "../components/AuthLayout";
import { ProfilePhotoEditor } from "../components/ProfilePhotoEditor";
import { Input } from "@components/Input";
import { Textarea } from "@components/Textarea";
import { ErrorAlert } from "@components/ErrorAlert";
import { SubmitButton } from "@components/SubmitButton";
import { useFormState } from "@utils/UseFormState";
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateCharacters,
} from "@utils/validation";
import { useValidation } from "@hooks/useValidation";
import { useFormSubmit } from "@utils/UseFormSubmit";
import { ImageUp } from "lucide-react";

const validators = {
  name: (value) => validateCharacters(value, "Nombre"),
  last_name: (value) => validateCharacters(value, "Apellido"),
  email: validateEmail,
  password: validatePassword,
  password_confirmation: (value, form) =>
    validatePasswordConfirmation(form.password, value),
};

export default function RegisterPage() {
  const { signup } = useUser();

  const { form, setField } = useFormState({
    email: "",
    password: "",
    password_confirmation: "",
    name: "",
    last_name: "",
    description: "",
    profile_photo: null,
  });

  const { errors, validate } = useValidation(validators);
  const { error, onSubmit } = useFormSubmit(signup, "/");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate(form)) {
      onSubmit(form);
    }
  };

  const [showEditor, setShowEditor] = useState(false);
  const [preview, setPreview] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);

  return (
    <AuthLayout
      title="Registro"
      footerText="¿Ya tienes una cuenta?"
      footerLink="/iniciar_sesion"
      footerLinkText="Inicia sesión"
      showLogo={false}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="flex justify-center">
          <div className="relative w-28 h-28">
            <div className="w-full h-full rounded-full overflow-hidden bg-gray-300 cursor-pointer group relative">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover object-center transition duration-200 group-hover:brightness-75"
                />
              ) : (
                <span className="flex items-center justify-center h-full text-gray-600">
                  Sin foto
                </span>
              )}

              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                <ImageUp className="w-6 h-6 text-white" />
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  const validTypes = ["image/jpeg", "image/png"];
                  if (!validTypes.includes(file.type)) {
                    alert("Solo se permiten imágenes en formato JPG o PNG.");
                    e.target.value = "";
                    return;
                  }

                  if (fileUrl) URL.revokeObjectURL(fileUrl);

                  setFileUrl(URL.createObjectURL(file));
                  setShowEditor(true);
                  e.target.value = "";
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {showEditor && fileUrl && (
          <ProfilePhotoEditor
            imageSrc={fileUrl}
            onCancel={() => setShowEditor(false)}
            onApply={(croppedUrl, croppedFile) => {
              setPreview(croppedUrl);
              setField("profile_photo", croppedFile);
              setShowEditor(false);
            }}
          />
        )}

        {error.length > 0 && (
          <ErrorAlert>
            {error.map((err, idx) => (
              <p key={idx}>{err}</p>
            ))}
          </ErrorAlert>
        )}

        <Input
          id="name"
          type="text"
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          placeholder="Nombre"
          error={errors.name}
        />

        <Input
          id="last_name"
          type="text"
          value={form.last_name}
          onChange={(e) => setField("last_name", e.target.value)}
          placeholder="Apellido"
          error={errors.last_name}
        />

        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setField("email", e.target.value)}
          placeholder="Email"
          error={errors.email}
        />

        <Input
          id="password"
          type="password"
          value={form.password}
          onChange={(e) => setField("password", e.target.value)}
          placeholder="Contraseña"
          error={errors.password}
        />

        <Input
          id="password_confirmation"
          type="password"
          value={form.password_confirmation}
          onChange={(e) => setField("password_confirmation", e.target.value)}
          placeholder="Confirmación de contraseña"
          error={errors.password_confirmation}
        />

        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="Descripción"
        />

        <SubmitButton text="Confirmar" />
      </form>
    </AuthLayout>
  );
}