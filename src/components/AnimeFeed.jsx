import React, { useState, useRef, useCallback } from 'react';
import {
  MagnifyingGlassIcon,
  InformationCircleIcon,
  HeartIcon,
  PlusIcon,
  StarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import ExplorePanel from './ExplorePanel';

function AnimeFeed({
  animes,
  loading,
  onSelectAnime,
  onToggleFavorite,
  onAddToList,
  onLoadMore,
  hasMore,
  onSearch,
  onClearSearch,
  onExplore,
  onClearExplore,
  exploreMeta,
  exploreLoading,
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const observerRef = useRef();
  const loadingMoreRef = useRef(false);

  const handleSearch = (event) => {
    event.preventDefault();

    if (searchQuery.trim() !== '' && onSearch) {
      onSearch(searchQuery);
      setIsSearchOpen(false);
      setSearchQuery('');
      setIsExploreOpen(false);
    }
  };

  const handleExplore = (params) => {
    if (onExplore) {
      onExplore(params);
      setIsExploreOpen(false);
    }
  };

  const handleClearExplore = () => {
    if (onClearExplore) onClearExplore();
  };

  const lastAnimeElementRef = useCallback(
    (node) => {
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && onLoadMore && !loadingMoreRef.current) {
          loadingMoreRef.current = true;
          onLoadMore();
          window.setTimeout(() => {
            loadingMoreRef.current = false;
          }, 1000);
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [hasMore, onLoadMore]
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border p-4">
        <div className="max-w-7xl mx-auto space-y-0">
          {isSearchOpen ? (
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Pesquisar anime..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                autoFocus
                className="flex-1 px-4 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                Ir
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                  if (onClearSearch) onClearSearch();
                }}
                className="p-2 rounded-lg border border-border hover:bg-accent/10 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <button
              type="button"
              className="p-2 rounded-lg border border-border hover:bg-accent/10 transition-colors"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Abrir pesquisa"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>
          )}

          <ExplorePanel
            isOpen={isExploreOpen}
            onToggle={() => setIsExploreOpen((open) => !open)}
            onExplore={handleExplore}
            onClearExplore={handleClearExplore}
            exploreMeta={exploreMeta}
            loading={exploreLoading}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {animes && animes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {animes.map((anime, index) => {
              const isLast = index === animes.length - 1;

              return (
                <div
                  key={`${anime.mal_id}-${index}`}
                  ref={isLast ? lastAnimeElementRef : null}
                  className="group rounded-lg overflow-hidden border border-border bg-card hover:border-accent transition-all duration-300 hover:shadow-lg"
                >
                  <div className="relative w-full pt-[140%] bg-muted overflow-hidden">
                    <img
                      src={anime.images?.jpg?.large_image_url || anime.image}
                      alt={anime.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                    {anime.score && (
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-accent/90 text-accent-foreground font-semibold text-sm">
                        <StarIcon className="w-4 h-4 inline-block" />
                        {' '}
                        {anime.score}
                      </div>
                    )}

                    {anime.rank ? (
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/55 text-white text-xs font-bold">
                        #{anime.rank}
                      </div>
                    ) : (
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-purple-600/85 text-white text-xs font-bold">
                        Aleatorio
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {anime.year && (
                        <span className="px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs font-medium">
                          {anime.year}
                        </span>
                      )}
                      {anime.episodes && (
                        <span className="px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs font-medium">
                          {anime.episodes} Episodios
                        </span>
                      )}
                    </div>

                    <h3
                      className="font-bold text-lg line-clamp-2 hover:text-accent transition-colors cursor-pointer"
                      onClick={() => onSelectAnime && onSelectAnime(anime.mal_id)}
                    >
                      {anime.title}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {anime.synopsis ? `${anime.synopsis.substring(0, 100)}...` : 'Sem sinopse disponivel.'}
                    </p>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => onSelectAnime && onSelectAnime(anime.mal_id)}
                        className="flex-1 px-3 py-2 rounded-lg border border-border hover:bg-accent/10 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <InformationCircleIcon className="w-4 h-4" />
                        Info
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleFavorite && onToggleFavorite(anime)}
                        className="flex-1 px-3 py-2 rounded-lg border border-border hover:bg-red-500/10 hover:border-red-500 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <HeartIcon className="w-4 h-4" />
                        Gosto
                      </button>
                      <button
                        type="button"
                        onClick={() => onAddToList && onAddToList(anime)}
                        className="flex-1 px-3 py-2 rounded-lg border border-border hover:bg-blue-500/10 hover:border-blue-500 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Lista
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <MagnifyingGlassIcon className="w-12 h-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground">
                {loading || exploreLoading ? 'A carregar animes...' : 'Nenhum anime encontrado.'}
              </p>
            </div>
          </div>
        )}

        {hasMore && (
          <div className="flex justify-center py-8">
            <div className="animate-spin">
              <div className="w-8 h-8 border-4 border-muted border-t-accent rounded-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnimeFeed;
