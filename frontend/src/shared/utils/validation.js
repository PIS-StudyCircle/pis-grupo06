export function validateRequired(value, fieldName = "This field") {
  if (!value || value.trim() === "") {
    return `${fieldName} es obligatorio`;
  }
  return null;
}

export function validateEmail(email) {
  if (!email) return "Email es obligatorio";
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email) ? null : "Correo electrónico no válido";
}

export function validatePassword(password) {
  if (!password) return "Password es obligatorio";
  if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres";
  return null;
}

export function validatePasswordConfirmation(password, confirmation) {
  if (password !== confirmation) return "Las contraseñas no coinciden";
  return null;
}
