const API_BASE = '';

/**
 * Busca todos os produtos do catálogo.
 * @returns {Promise<Array<{id: string, name: string, filename: string, image_url: string}>>}
 */
export async function fetchProducts() {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error('Erro ao buscar produtos');
  return res.json();
}

/**
 * Envia a lista de IDs favoritos e recebe recomendações da IA.
 * @param {string[]} favorites - Lista de IDs de produtos favoritos
 * @param {number} nResults - Número de recomendações desejadas
 * @returns {Promise<{recommendations: Array<{id: string, name: string, filename: string, image_url: string}>}>}
 */
export async function fetchRecommendations(favorites, nResults = 10) {
  const res = await fetch(`${API_BASE}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ favorites, n_results: nResults }),
  });
  if (!res.ok) throw new Error('Erro ao buscar recomendações');
  return res.json();
}
