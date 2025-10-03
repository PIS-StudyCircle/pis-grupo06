export function validateRequired(value, fieldName = "This field") {
  if (!value || value.trim() === "") {
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

export function validateCharacters(value, fieldName = "This field"){
  if (validateRequired(value, fieldName) !== null) {
    return this.validateRequired(value, fieldName);
  }
  const regex = /^[A-Za-zÁÉÍÓÚáéíóúÜüÑñ\-]+$/; //agrego el character guion (-) por apellidos compuestos
  return regex.test(value) ? null : `El campo ${fieldName} contiene caracteres no válidos`;
}
