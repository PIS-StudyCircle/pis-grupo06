
export function validateRequired(value, fieldName = "") {
  if (!value || value.trim() === "") {
    return `El campo ${fieldName} es obligatorio`;

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

  // Parsear manualmente la fecha en formato YYYY-MM-DD para validar en cualquier zona horaria
  const [year, month, day] = date.split("-").map(Number);
  const inputDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(inputDate.getTime())) return "La fecha no es válida";
  if (inputDate < today) return "La fecha no puede ser anterior a hoy";

  return null;
}

export function validateHoursTutoring(date, startTime, endTime) {
  if (!startTime || !endTime) return null;
  if (endTime <= startTime) return "La hora de fin debe ser posterior a la de inicio";

  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const start = startH * 60 + startM;
  const end = endH * 60 + endM;
  if (end - start < 60) return "El rango horario debe ser de al menos 1 hora";

  // Si se pasa la fecha, validar que la hora de inicio sea al menos 3 horas después de ahora
  if (date) {
    const [year, month, day] = date.split("-").map(Number);
    const inputDate = new Date(year, month - 1, day);
    const today = new Date();
    if (
      inputDate.getFullYear() === today.getFullYear() &&
      inputDate.getMonth() === today.getMonth() &&
      inputDate.getDate() === today.getDate()
    ) {
      const nowMinutes = today.getHours() * 60 + today.getMinutes();
      if (start - nowMinutes < 180) {
        return "La hora de inicio debe ser al menos 3 horas mayor que la actual";
      }
    }
  }

  return null;
}

export function validateInteger(value, fieldName = "Valor") {
  if (!value) return `El campo ${fieldName} es obligatorio`;
  if (parseInt(value, 10) < 1) return `El campo ${fieldName} debe ser mayor a 0`;
  return null;
}
export function validateCharacters(value, fieldName = "") {
  const requiredError = validateRequired(value, fieldName);
  if (requiredError !== null) {
    return requiredError;
  }
  const regex = /^[A-Za-zÁÉÍÓÚáéíóúÜüÑñ]+(?:[- ][A-Za-zÁÉÍÓÚáéíóúÜüÑñ]+)*$/
  // permite letras minusculas y mayusculas, espacio solo entre palabras, letras con tildes, ñ y '-' entre caracteres
  return regex.test(value)
    ? null
    : `El campo ${fieldName} contiene caracteres no válidos`;
}

