import { CURATED_CARTOONS } from '../data/curatedCartoons';
import {
  fetchJikanJson,
  fetchRandomAnimes,
  fetchAnimeByIds,
} from './jikanApi';
import { isTmdbConfigured, fetchExploreCartoons } from './tmdbApi';

const PAGE_SIZE = 25;
const BULK_IDS_LIMIT = 50;

export const EXPLORE_SOURCES = [
  { id: 'anime', label: 'Anime' },
  { id: 'cartoons', label: 'Desenhos' },
];

export const CARTOON_CATEGORIES = [
  { id: 'popular', label: 'Populares', description: 'Desenhos animados mais populares' },
  { id: 'top', label: 'Top Geral', description: 'Melhor avaliados na TMDB' },
  { id: 'seasonal', label: 'Recentes', description: 'Estreias mais recentes' },
  { id: 'score', label: 'Por Nota', description: 'Maior pontuacao da comunidade' },
  { id: 'random', label: 'Aleatorio', description: 'Pagina aleatoria de descoberta' },
];

export const EXPLORE_CATEGORIES = [
  { id: 'top', label: 'Top Geral', description: 'Ranking oficial do MyAnimeList' },
  { id: 'seasonal', label: 'Temporada', description: 'Animes da temporada atual' },
  { id: 'popular', label: 'Populares', description: 'Mais vistos pela comunidade' },
  { id: 'score', label: 'Por Nota', description: 'Melhor pontuacao (score)' },
  { id: 'random', label: 'Aleatorio', description: 'Descobre animes ao acaso' },
];

export const EXPLORE_LIMITS = [25, 50, 100];

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
    const batch = await fetchAnimeByIds(chunk);
    collected.push(...batch);
  }

  const byId = new Map(collected.map((anime) => [anime.mal_id, anime]));
  return idOrder.map((id) => byId.get(id)).filter(Boolean);
}

function getCategoryPageUrl(category, page) {
  switch (category) {
    case 'top':
      return `/top/anime?page=${page}`;
    case 'seasonal':
      return `/seasons/now?page=${page}`;
    case 'popular':
      return `/top/anime?filter=bypopularity&page=${page}`;
    case 'score':
      return `/anime?order_by=score&sort=desc&min_score=6&page=${page}`;
    default:
      return null;
  }
}

export async function fetchExploreAnimes(category, limit = 25, source = 'anime') {
  const safeLimit = EXPLORE_LIMITS.includes(limit) ? limit : 25;

  if (source === 'cartoons') {
    if (isTmdbConfigured) {
      return fetchExploreCartoons(category || 'popular', safeLimit);
    }
    return fetchCuratedCartoons(safeLimit);
  }

  if (category === 'random') {
    return fetchRandomAnimes(safeLimit);
  }

  const pagesNeeded = Math.ceil(safeLimit / PAGE_SIZE);
  const results = [];
  const seen = new Set();

  for (let page = 1; page <= pagesNeeded && results.length < safeLimit; page += 1) {
    const path = getCategoryPageUrl(category, page);
    if (!path) break;

    const data = await fetchJikanJson(path);
    const batch = Array.isArray(data?.data) ? data.data : [];

    batch.forEach((anime) => {
      if (!anime?.mal_id || seen.has(anime.mal_id)) return;
      seen.add(anime.mal_id);
      results.push(anime);
    });

    if (!data?.pagination?.has_next_page) break;
  }

  return results.slice(0, safeLimit);
}

export function getExploreCategoryLabel(categoryId, source = 'anime') {
  if (source === 'cartoons') {
    if (isTmdbConfigured) {
      return CARTOON_CATEGORIES.find((item) => item.id === categoryId)?.label || 'Desenhos Animados';
    }
    return 'Desenhos Animados';
  }
  return EXPLORE_CATEGORIES.find((item) => item.id === categoryId)?.label || 'Explorar';
}
