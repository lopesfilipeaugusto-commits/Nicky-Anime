import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';

const PER_PAGE = 6;
const LOAD_MORE_THRESHOLD = 400; // px antes do fim para disparar auto-load

const QuickSuggestions = memo(({ onSelectAnime }) => {
  const [animes, setAnimes] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const loadTriggerRef = useRef(null);
  const observerRef = useRef(null);
  const hasAutoLoaded = useRef(false);

  const fetchPage = useCallback(async (pageNum) => {
    const offset = pageNum * PER_PAGE;

    const requests = Array.from({ length: PER_PAGE }, (_, i) =>
      fetch(`https://api.jikan.moe/v4/random/anime`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
          return res.json();
        })
        .catch((err) => {
          console.error('Erro ao carregar anime:', err);
          return null;
        })
    );

    const results = await Promise.all(requests);
    const valid = results.filter((d) => d && d.data).map((d) => d.data);

    return { items: valid, done: valid.length < PER_PAGE };
  }, []);

  // Primeira carga
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { items, done } = await fetchPage(0);
        if (!cancelled) {
          setAnimes(items);
          setHasMore(!done);
          setPage(0);
        }
      } catch (e) {
        console.error('Erro na carga inicial:', e);
        if (!cancelled) setHasMore(false);
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [fetchPage]);

  // Carregar mais páginas
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const nextPage = page + 1;
      const { items, done } = await fetchPage(nextPage);
      setAnimes((prev) => [...prev, ...items]);
      setHasMore(!done);
      setPage(nextPage);
    } catch (e) {
      console.error('Erro ao carregar mais:', e);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, fetchPage]);

  // Intersection Observer para scroll automático
  useEffect(() => {
    if (!hasMore || loading || hasAutoLoaded.current && page > 0) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !loading) {
          if (loadTriggerRef.current) {
            loadTriggerRef.current.classList.add('triggered');
          }
          loadMore();
        }
      },
      {
        rootMargin: `${LOAD_MORE_THRESHOLD}px 0px 0px 0px`,
        threshold: 0
      }
    );

    const el = loadTriggerRef.current;
    if (el) observerRef.current.observe(el);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasMore, loading, loadMore, page]);

  const handleRefresh = useCallback(async () => {
    setPage(0);
    setHasMore(true);
    setLoading(true);
    setAnimes([]);
    setInitialLoading(true);
    hasAutoLoaded.current = false;

    try {
      const { items, done } = await fetchPage(0);
      setAnimes(items);
      setHasMore(!done);
      setPage(0);
    } catch (e) {
      console.error('Erro ao recarregar:', e);
      setHasMore(false);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [fetchPage]);

  if (initialLoading) {
    return (
      <div className="quick-suggestions-container" id="quickSuggestions">
        <div className="suggestions-header">
          <h3>Descobrir Animes</h3>
        </div>
        <div className="suggestions-loading">A carregar sugestoes...</div>
      </div>
    );
  }

  return (
    <div className="quick-suggestions-container" id="quickSuggestions">
      <div className="suggestions-header">
        <h3>Descobrir Animes</h3>
        <button
          className="refresh-suggestions-btn"
          onClick={handleRefresh}
          title="Carregar novas sugestoes"
        >
          Novas Sugestoes
        </button>
      </div>

      <div className="suggestions-feed">
        {animes.map((anime) => (
          <div
            key={`${anime.mal_id}-${anime.title?.replace(/\s+/g, '-')}`}
            className="suggestion-card suggestion-card-feed"
            onClick={() => onSelectAnime(anime.mal_id)}
            title={anime.title}
          >
            <div className="suggestion-image-wrapper suggestion-image-wrapper-feed">
              <img
                className="suggestion-image suggestion-image-feed"
                src={
                  anime.images?.jpg?.large_image_url ||
                  anime.images?.jpg?.image_url ||
                  anime.images?.jpg?.small_image_url ||
                  ''
                }
                alt={anime.title}
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="suggestion-overlay">
                <span className="suggestion-select-btn">Ver Detalhes</span>
              </div>
            </div>
            <div className="suggestion-info">
              <h4>{anime.title}</h4>
              <p className="suggestion-score">
                {anime.score ? `Nota: ${anime.score}` : 'Sem nota'}
              </p>
              {anime.episodes && (
                <p className="suggestion-episodes">{anime.episodes} episodios</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Sentinel — Intersection Observer detecta este elemento */}
      <div
        ref={loadTriggerRef}
        className={`infinite-trigger${hasMore ? '' : ' hidden'}`}
        aria-hidden="true"
      />

      {/* Load More fallback / explicit button */}
      {hasMore && (
        <button
          className={`load-more-btn${loading ? ' load-more-loading' : ''}`}
          onClick={loadMore}
          disabled={loading}
          type="button"
          aria-label="Carregar mais animes"
        >
          {loading ? (
            <span className="load-more-spinner" />
          ) : (
            <>
              <span className="load-more-arrow">↓</span>
              Carregar mais
            </>
          )}
        </button>
      )}

      {!hasMore && animes.length > 0 && (
        <p className="feed-end">
          <SparklesIcon className="w-4 h-4 inline-block align-text-bottom mr-2" />
          Já chegaste ao fim das sugestões por agora
        </p>
      )}
    </div>
  );
});

QuickSuggestions.displayName = 'QuickSuggestions';
export default QuickSuggestions;
