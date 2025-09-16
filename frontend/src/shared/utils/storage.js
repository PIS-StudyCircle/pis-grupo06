export function saveItem(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save ${key}:`, err);
  }
}

export function getItem(key, fallback = null) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function removeItem(key) {
  try {
    sessionStorage.removeItem(key);
  } catch (err) {
    console.error(`Failed to remove ${key}:`, err);
  }
}
