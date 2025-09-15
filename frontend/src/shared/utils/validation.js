export function validateRequired(value, fieldName = "This field") {
  if (!value || value.trim() === "") {
    return `${fieldName} is required`;
  }
  return null;
}

export function validateEmail(email) {
  if (!email) return "Email is required";
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email) ? null : "Invalid email address";
}

export function validatePassword(password) {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters long";
  return null;
}

export function validatePasswordConfirmation(password, confirmation) {
  if (password !== confirmation) return "Passwords do not match";
  return null;
}
