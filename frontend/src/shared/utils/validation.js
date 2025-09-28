export function validateRequired(value, fieldName = "campo", gender = "m") {
  if (!value || value.trim() === "") {
    if (gender === "f") {
      return `La ${fieldName} es obligatoria`;
    }
    return `El ${fieldName} es obligatorio`;
  }
  return null;
}

export function validateEmail(email) {
  if (!email) return "El email es obligatorio";
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email) ? null : "Correo electrónico no válido";
}

export function validatePassword(password) {
  if (!password) return "La contraseña es obligatoria";
  if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres";
  return null;
}

export function validatePasswordConfirmation(password, confirmation) {
  if (password !== confirmation) return "Las contraseñas no coinciden";
  return null;
}

export function validateDate(date) {
  if (!date) return "La fecha es obligatoria";

  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  if (isNaN(inputDate.getTime())) return "Fecha no válida";
  if (inputDate < today) return "La fecha no puede ser anterior a hoy";

  return null;
}
