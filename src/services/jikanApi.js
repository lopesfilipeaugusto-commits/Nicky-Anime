const JIKAN_BASE = 'https://api.jikan.moe/v4';
const REQUEST_DELAY_MS = 400;
const RATE_LIMIT_RETRY_MS = 1500;
const DEFAULT_RETRIES = 4;

export const JIKAN_RATE_LIMIT_ERROR =
  'Demasiados pedidos seguidos. Espera alguns segundos e tenta outra vez.';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let queueTail = Promise.resolve();
let lastRequestAt = 0;

function enqueue(task) {
  const run = queueTail.then(async () => {
    const elapsed = Date.now() - lastRequestAt;
    if (elapsed < REQUEST_DELAY_MS) {
      await sleep(REQUEST_DELAY_MS - elapsed);
    }
    lastRequestAt = Date.now();
    return task();
  });
  queueTail = run.catch(() => {});
  return run;
}

function buildUrl(path) {
  if (path.startsWith('http')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${JIKAN_BASE}${normalized}`;
}

export async function fetchJikanJson(path, { retries = DEFAULT_RETRIES, silent = false } = {}) {
  return enqueue(async () => {
    const url = buildUrl(path);

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const response = await fetch(url, {
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (response.status === 429) {
        await sleep(RATE_LIMIT_RETRY_MS);
        continue;
      }

      if (!response.ok) {
        if (silent) return null;
        throw new Error(`HTTP Error ${response.status}`);
      }

      return response.json();
    }

    if (silent) return null;
    throw new Error(JIKAN_RATE_LIMIT_ERROR);
  });
}

export function getAnimeImage(anime) {
  if (!anime) return '';

  return (
    anime.images?.webp?.large_image_url ||
    anime.images?.jpg?.large_image_url ||
    anime.images?.webp?.image_url ||
    anime.images?.jpg?.image_url ||
    anime.images?.jpg?.small_image_url ||
    anime.image ||
    ''
  );
}

export async function fetchAnimeById(id, { silent = false } = {}) {
  const data = await fetchJikanJson(`/anime/${id}`, { silent });
  return data?.data ?? null;
}

export async function searchAnime(query) {
  const data = await fetchJikanJson(`/anime?q=${encodeURIComponent(query)}`);
  return Array.isArray(data?.data) ? data.data : [];
}

export async function fetchTopAnimePage(page) {
  return fetchJikanJson(`/top/anime?page=${page}`);
}

export async function fetchRandomAnime({ silent = true, retries = DEFAULT_RETRIES } = {}) {
  const data = await fetchJikanJson('/random/anime', { silent, retries });
  return data?.data ?? null;
}

function isUniqueAnime(anime, excludeIds, collected) {
  if (!anime?.mal_id || excludeIds.has(anime.mal_id)) return false;
  return !collected.some((item) => item.mal_id === anime.mal_id);
}

function addUniqueAnime(anime, excludeIds, collected) {
  if (!isUniqueAnime(anime, excludeIds, collected)) return false;
  excludeIds.add(anime.mal_id);
  collected.push(anime);
  return true;
}

async function fetchRandomTopPage(excludeIds, collected) {
  const page = Math.floor(Math.random() * 40) + 2;
  const data = await fetchJikanJson(`/top/anime?page=${page}`, { silent: true });
  const batch = Array.isArray(data?.data) ? data.data : [];

  batch.forEach((anime) => {
    addUniqueAnime(anime, excludeIds, collected);
  });
}

export async function fetchRandomAnimes(count, excludeIds = new Set()) {
  const animes = [];
  const maxAttempts = Math.max(count * 6, 12);

  for (let attempt = 0; attempt < maxAttempts && animes.length < count; attempt += 1) {
    try {
      const anime = await fetchRandomAnime({ silent: true });
      addUniqueAnime(anime, excludeIds, animes);
    } catch {
      // ignora falhas pontuais
    }
  }

  return animes;
}

export async function fetchDiscoveryAnimes(count, excludeIds = new Set()) {
  const safeCount = Math.max(count, 1);
  const localExcludeIds = new Set(excludeIds);
  const animes = await fetchRandomAnimes(safeCount, localExcludeIds);

  if (animes.length >= safeCount) {
    return animes.slice(0, safeCount);
  }

  let fallbackAttempts = 0;
  while (animes.length < safeCount && fallbackAttempts < 3) {
    fallbackAttempts += 1;
    try {
      await fetchRandomTopPage(localExcludeIds, animes);
    } catch {
      // ignora falhas pontuais
    }
  }

  return animes.slice(0, safeCount);
}

export async function fetchAnimeByIds(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return [];

  const data = await fetchJikanJson(`/anime?ids=${ids.join(',')}`);
  return Array.isArray(data?.data) ? data.data : [];
}
