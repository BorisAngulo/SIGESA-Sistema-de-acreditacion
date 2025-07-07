export async function getActualizaciones() {
  const data = await import('../data/actualizaciones.json');
  return data.default;
}
