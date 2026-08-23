// Cliente HTTP base do frontend (tarefa 63).
// Centraliza o fetch: monta a URL a partir de VITE_API_URL, envia o header
// Authorization quando existe token e transforma respostas de erro do backend
// em um Error consistente, para que todas as telas tratem erro do mesmo jeito.

const BASE_URL = import.meta.env.VITE_API_URL;

export const TOKEN_STORAGE_KEY = 'auth.token';

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

// Erro padrão da API: guarda o status HTTP e o corpo devolvido pelo backend,
// para a tela poder reagir a casos específicos (401, 409, 502...).
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function buildUrl(endpoint) {
  if (/^https?:\/\//i.test(endpoint)) return endpoint;
  return `${String(BASE_URL ?? '').replace(/\/$/, '')}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
}

/**
 * @param {string} endpoint  caminho da API, ex.: '/events'
 * @param {object} [options]
 * @param {string} [options.method]
 * @param {any}    [options.body]   objeto serializado como JSON (ou BodyInit cru)
 * @param {object} [options.headers]
 * @param {string|null} [options.token]  token explícito; por padrão usa o do localStorage
 * @param {boolean} [options.auth]       false desliga o header Authorization
 */
export async function apiFetch(endpoint, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    token,
    auth = true,
    ...rest
  } = options;

  const finalHeaders = { Accept: 'application/json', ...headers };

  const isPlainBody = body !== undefined && body !== null && !(body instanceof FormData);
  if (isPlainBody && !finalHeaders['Content-Type']) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  const authToken = token !== undefined ? token : getStoredToken();
  if (auth && authToken) {
    finalHeaders.Authorization = `Bearer ${authToken}`;
  }

  let response;
  try {
    response = await fetch(buildUrl(endpoint), {
      ...rest,
      method,
      headers: finalHeaders,
      body: isPlainBody && !(typeof body === 'string') ? JSON.stringify(body) : body,
    });
  } catch (networkError) {
    throw new ApiError(
      'Não foi possível conectar ao servidor. Verifique sua conexão.',
      0,
      { cause: String(networkError?.message ?? networkError) },
    );
  }

  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type') ?? '';
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (!response.ok) {
    // O backend responde erros no formato { error: 'mensagem' }.
    const message =
      (data && typeof data === 'object' && data.error) ||
      (typeof data === 'string' && data) ||
      'Erro inesperado. Tente novamente.';
    throw new ApiError(message, response.status, data);
  }

  return data;
}

export const api = {
  get: (endpoint, options) => apiFetch(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => apiFetch(endpoint, { ...options, method: 'POST', body }),
  patch: (endpoint, body, options) => apiFetch(endpoint, { ...options, method: 'PATCH', body }),
  put: (endpoint, body, options) => apiFetch(endpoint, { ...options, method: 'PUT', body }),
  delete: (endpoint, options) => apiFetch(endpoint, { ...options, method: 'DELETE' }),
};

export default apiFetch;
