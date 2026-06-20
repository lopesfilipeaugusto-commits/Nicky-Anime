import { CURATED_CARTOONS } from '../data/curatedCartoons';

const JIKAN_BASE = 'https://api.jikan.moe/v4';
const PAGE_SIZE = 25;
const REQUEST_DELAY_MS = 350;

export const EXPLORE_SOURCES = [
  { id: 'anime', label: 'Anime' },
  { id: 'cartoons', label: 'Desenhos' },
];

export const EXPLORE_CATEGORIES = [
  { id: 'top', label: 'Top Geral', description: 'Ranking oficial do MyAnimeList' },
  { id: 'seasonal', label: 'Temporada', description: 'Animes da temporada atual' },
  { id: 'popular', label: 'Populares', description: 'Mais vistos pela comunidade' },
  { id: 'score', label: 'Por Nota', description: 'Melhor pontuacao (score)' },
  { id: 'random', label: 'Aleatorio', description: 'Descobre animes ao acaso' },
];

export const EXPLORE_LIMITS = [25, 50, 100];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchJikanJson(url, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const response = await fetch(url);

    if (response.status === 429) {
      await sleep(1000);
      continue;
    }

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`);
    }

    return response.json();
  }

  throw new Error('Demasiados pedidos seguidos. Espera alguns segundos e tenta outra vez.');
}

const BULK_IDS_LIMIT = 50;

export async function fetchCuratedCartoons(limit = 25) {
  const safeLimit = Math.min(
    EXPLORE_LIMITS.includes(limit) ? limit : 25,
    CURATED_CARTOONS.length
  );
  const selected = CURATED_CARTOONS.slice(0, safeLimit);
  const idOrder = selected.map((item) => item.mal_id);
  const collected = [];

  for (let index = 0; index < idOrder.length; index += BULK_IDS_LIMIT) {
    const chunk = idOrder.slice(index, index + BULK_IDS_LIMIT);
    const data = await fetchJikanJson(`${JIKAN_BASE}/anime?ids=${chunk.join(',')}`);
    const batch = Array.isArray(data?.data) ? data.data : [];
    collected.push(...batch);

    if (index + BULK_IDS_LIMIT < idOrder.length) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  const byId = new Map(collected.map((anime) => [anime.mal_id, anime]));
  return idOrder.map((id) => byId.get(id)).filter(Boolean);
}

function getCategoryPageUrl(category, page) {
  switch (category) {
    case 'top':
      return `${JIKAN_BASE}/top/anime?page=${page}`;
    case 'seasonal':
      return `${JIKAN_BASE}/seasons/now?page=${page}`;
    case 'popular':
      return `${JIKAN_BASE}/top/anime?filter=bypopularity&page=${page}`;
    case 'score':
      return `${JIKAN_BASE}/anime?order_by=score&sort=desc&min_score=6&page=${page}`;
    default:
      return null;
  }
}

export async function fetchRandomAnimes(count, excludeIds = new Set()) {
  const animes = [];
  const maxAttempts = count * 4;

  for (let attempt = 0; attempt < maxAttempts && animes.length < count; attempt += 1) {
    try {
      const data = await fetchJikanJson(`${JIKAN_BASE}/random/anime`, 1);
      const anime = data?.data;

      if (!anime?.mal_id || excludeIds.has(anime.mal_id)) continue;
      if (animes.some((item) => item.mal_id === anime.mal_id)) continue;

      excludeIds.add(anime.mal_id);
      animes.push(anime);
    } catch {
      // ignora falhas pontuais
    }

    if (animes.length < count) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  return animes;
}

export async function fetchExploreAnimes(category, limit = 25, source = 'anime') {
  const safeLimit = EXPLORE_LIMITS.includes(limit) ? limit : 25;

  if (source === 'cartoons') {
    return fetchCuratedCartoons(safeLimit);
  }

  if (category === 'random') {
    return fetchRandomAnimes(safeLimit);
  }

  const pagesNeeded = Math.ceil(safeLimit / PAGE_SIZE);
  const results = [];
  const seen = new Set();

  for (let page = 1; page <= pagesNeeded && results.length < safeLimit; page += 1) {
    const url = getCategoryPageUrl(category, page);
    if (!url) break;

    const data = await fetchJikanJson(url);
    const batch = Array.isArray(data?.data) ? data.data : [];

    batch.forEach((anime) => {
      if (!anime?.mal_id || seen.has(anime.mal_id)) return;
      seen.add(anime.mal_id);
      results.push(anime);
    });

    if (!data?.pagination?.has_next_page) break;
    if (page < pagesNeeded) await sleep(REQUEST_DELAY_MS);
  }

  return results.slice(0, safeLimit);
}

export function getExploreCategoryLabel(categoryId, source = 'anime') {
  if (source === 'cartoons') {
    return 'Desenhos Animados';
  }
  return EXPLORE_CATEGORIES.find((item) => item.id === categoryId)?.label || 'Explorar';
}
