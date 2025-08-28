export async function getFaculties() {
  // En un futuro esto va a ser un fetch a backend
  return Promise.resolve([
    { id: 1, name: "Ingeniería" },
    { id: 2, name: "Arquitectura" },
    { id: 3, name: "Medicina" },
  ]);
}
