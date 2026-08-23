import 'dotenv/config';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const CACHE_TTL_MS = 10 * 60 * 1000;

// Cache em memória: guarda a resposta por 10 minutos para não repetir
// chamada ao TMDb a cada busca igual.
const cache = new Map();

function getCached(key) {
  const entry = cache.get(key);

  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.value;
}

function setCached(key, value) {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

function unavailableError() {
  const error = new Error('Catálogo indisponível no momento');
  error.status = 502;
  return error;
}

// Traduz o JSON do TMDb para o formato do sistema. Assim o resto do
// backend não fica preso ao formato deles.
function normalize(movie) {
  return {
    externalId: String(movie.id),
    title: movie.title,
    synopsis: movie.overview || '',
    imageUrl: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null,
    year: movie.release_date ? Number(movie.release_date.slice(0, 4)) : null,
  };
}

async function request(path, params = {}) {
  if (!process.env.TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY não configurada');
  }

  const url = new URL(BASE_URL + path);
  url.searchParams.set('api_key', process.env.TMDB_API_KEY);
  url.searchParams.set('language', 'pt-BR');

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  let response;

  try {
    response = await fetch(url);
  } catch {
    throw unavailableError();
  }

  // 404 é "filme não existe", não é o TMDb fora do ar.
  if (response.status === 404) return null;

  if (!response.ok) {
    throw unavailableError();
  }

  try {
    return await response.json();
  } catch {
    throw unavailableError();
  }
}

export async function searchMovies(query) {
  const cacheKey = `search:${query.toLowerCase()}`;
  const cached = getCached(cacheKey);

  if (cached) return cached;

  const data = await request('/search/movie', { query });
  const movies = (data?.results ?? []).map(normalize);

  setCached(cacheKey, movies);

  return movies;
}

export async function getMovie(externalId) {
  const cacheKey = `movie:${externalId}`;
  const cached = getCached(cacheKey);

  if (cached) return cached;

  const data = await request(`/movie/${externalId}`);

  if (!data) {
    const error = new Error('Filme não encontrado no catálogo');
    error.status = 404;
    throw error;
  }

  const movie = normalize(data);

  setCached(cacheKey, movie);

  return movie;
}
