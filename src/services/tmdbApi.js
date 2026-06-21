const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/';

const accessToken = process.env.REACT_APP_TMDB_ACCESS_TOKEN || '';
const apiKey = process.env.REACT_APP_TMDB_API_KEY || '';

export const isTmdbConfigured = Boolean(accessToken.trim() || apiKey.trim());

async function fetchTmdb(path, params = {}) {
  if (!isTmdbConfigured) {
    throw new Error('TMDB nao configurado. Define REACT_APP_TMDB_ACCESS_TOKEN ou REACT_APP_TMDB_API_KEY no .env.');
  }

  const url = new URL(`${TMDB_BASE}${path.startsWith('/') ? path : `/${path}`}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  const headers = { Accept: 'application/json' };
  if (accessToken.trim()) {
    headers.Authorization = `Bearer ${accessToken.trim()}`;
  } else {
    url.searchParams.set('api_key', apiKey.trim());
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`TMDB HTTP ${response.status}`);
  }

  return response.json();
}

export function getTmdbPosterUrl(path, size = 'w500') {
  if (!path) return '';
  return `${IMAGE_BASE}${size}${path}`;
}

export function isTmdbMalId(id) {
  const num = Number(id);
  return Number.isFinite(num) && num < 0;
}

export function normalizeTmdbShow(show) {
  const tmdbId = show.id;
  const posterUrl = getTmdbPosterUrl(show.poster_path, 'w500');

  return {
    mal_id: -tmdbId,
    tmdb_id: tmdbId,
    source: 'tmdb',
    title: show.name || show.original_name || 'Sem titulo',
    title_english: show.original_name || '',
    images: {
      jpg: {
        large_image_url: posterUrl,
        image_url: getTmdbPosterUrl(show.poster_path, 'w342'),
      },
    },
    image: posterUrl,
    synopsis: show.overview || '',
    score: show.vote_average ? Number(show.vote_average.toFixed(1)) : null,
    year: show.first_air_date ? show.first_air_date.slice(0, 4) : null,
    episodes: show.number_of_episodes || null,
  };
}

export async function fetchTmdbShowById(tmdbId) {
  const data = await fetchTmdb(`/tv/${tmdbId}`, { language: 'pt-PT' });
  return normalizeTmdbShow(data);
}

function getDiscoverParams(category, page) {
  const params = {
    language: 'pt-PT',
    include_adult: 'false',
    with_genres: '16',
    page: String(page),
  };

  switch (category) {
    case 'top':
      params.sort_by = 'vote_average.desc';
      params['vote_count.gte'] = '100';
      break;
    case 'score':
      params.sort_by = 'vote_average.desc';
      params['vote_count.gte'] = '200';
      break;
    case 'random':
      params.sort_by = 'popularity.desc';
      params.page = String(Math.floor(Math.random() * 50) + 1);
      break;
    case 'seasonal':
      params.sort_by = 'first_air_date.desc';
      params['first_air_date.lte'] = new Date().toISOString().slice(0, 10);
      break;
    case 'popular':
    default:
      params.sort_by = 'popularity.desc';
      break;
  }

  return params;
}

export async function fetchExploreCartoons(category = 'popular', limit = 25) {
  const safeLimit = [25, 50, 100].includes(limit) ? limit : 25;
  const isRandom = category === 'random';
  const pagesNeeded = isRandom ? 1 : Math.ceil(safeLimit / 20);
  const results = [];
  const seen = new Set();

  for (let page = 1; page <= pagesNeeded && results.length < safeLimit; page += 1) {
    const params = getDiscoverParams(category, page);
    const data = await fetchTmdb('/discover/tv', params);
    const batch = Array.isArray(data?.results) ? data.results.map(normalizeTmdbShow) : [];

    batch.forEach((item) => {
      if (!item?.mal_id || seen.has(item.mal_id)) return;
      seen.add(item.mal_id);
      results.push(item);
    });

    if (isRandom || !data?.total_pages || page >= data.total_pages) break;
  }

  return results.slice(0, safeLimit);
}
