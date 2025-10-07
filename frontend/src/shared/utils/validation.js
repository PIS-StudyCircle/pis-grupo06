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

export function validateStartHourTutoring(date, startTime, waitMinutes=180, fieldName="hora") {
  if (!date || !startTime) return null;

  const [startH, startM] = startTime.split(":").map(Number);

  // Construir Date con fecha + hora en zona local
  const [year, month, day] = date.split("-").map(Number);
  const inputDateTime = new Date(year, month - 1, day, startH, startM, 0);

  const now = new Date();
  const diffMinutes = Math.floor((inputDateTime.getTime() - now.getTime()) / 60000);

  // Si la fecha+hora ya pasó
  if (diffMinutes < 0) {
    return `La ${fieldName} no puede ser anterior a la actual`;
  }

  // Validar que la diferencia sea al menos waitMinutes
  if (diffMinutes < waitMinutes) {
    return `La ${fieldName} debe ser al menos ${waitMinutes / 60} horas mayor que la actual`;
  }

  return null;
}

export function validateHoursTutoring(startTime, endTime) {
  // Si falta alguno no validamos la relación aquí (se validan individualmente)
  if (!startTime || !endTime) return null;

  const [startH, startM] = startTime.split(":").map(Number);
  const start = startH * 60 + startM;
  const [endH, endM] = endTime.split(":").map(Number);
  let end = endH * 60 + endM;

  if (end <= start) {
    end += 24 * 60;
  }

  const duration = end - start;

  if (duration < 60) return "La sesión debe durar al menos 1 hora";

  if (duration > (4 * 60)) return "La sesión no puede durar más de 4 horas";

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
  const regex = /^[A-Za-zÁÉÍÓÚáéíóúÜüÑñ-]+$/;
  return regex.test(value)
    ? null
    : `El campo ${fieldName} contiene caracteres no válidos`;
}

