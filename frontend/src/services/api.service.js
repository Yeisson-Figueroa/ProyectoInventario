// Puerto específico 5000 asignado para el backend API (en vez de usar localStorage)
export const PUERTO_API = 5000;
export const API_BASE_URL = `http://localhost:${PUERTO_API}/api`;

// Token almacenado en memoria de ejecución (sin persistencia en localStorage)
let tokenEnMemoria = null;

export function setTokenAuth(token) {
  tokenEnMemoria = token;
}

export function getTokenAuth() {
  return tokenEnMemoria;
}

export async function apiFetch(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (tokenEnMemoria) {
    headers['Authorization'] = `Bearer ${tokenEnMemoria}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error en la petición al servidor');
  }

  return data;
}
