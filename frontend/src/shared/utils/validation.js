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

export function validateHours(date, startTime, endTime) {
  if (!startTime || !endTime) return null;
  if (endTime <= startTime) return "La hora de fin debe ser posterior a la de inicio";

  // Al menos 30 minutos
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const start = startH * 60 + startM;
  const end = endH * 60 + endM;
  if (end - start < 30) return "La sesión debe durar al menos 30 minutos";

  // Si se pasa la fecha, validar que la hora de inicio sea al menos 3 horas después de ahora
  if (date) {
    const now = new Date();
    const tutoringDate = new Date(date);
    if (
      tutoringDate.toDateString() === now.toDateString()
    ) {
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      if (start - nowMinutes < 180) {
        return "La hora de inicio debe ser al menos 3 horas más tarde que la hora actual";
      }
    }
  }

  return null;
}

export function validateInteger(value, fieldName = "Valor") {
  if (!value) return `El ${fieldName} es obligatorio`;
  if (parseInt(value, 10) < 1) return `El ${fieldName} debe ser mayor a 0`;
  return null;
}