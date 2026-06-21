import React, { useState } from 'react';
import {
  SparklesIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  FilmIcon,
  TvIcon,
} from '@heroicons/react/24/outline';
import {
  EXPLORE_CATEGORIES,
  CARTOON_CATEGORIES,
  EXPLORE_LIMITS,
  EXPLORE_SOURCES,
} from '../services/jikanExplore';
import { isTmdbConfigured } from '../services/tmdbApi';
import { CURATED_CARTOONS_TOTAL } from '../data/curatedCartoons';
import '../styles/ExplorePanel.css';

function ExplorePanel({
  isOpen,
  onToggle,
  onExplore,
  onClearExplore,
  exploreMeta,
  loading,
}) {
  const [limit, setLimit] = useState(25);
  const [category, setCategory] = useState('top');
  const [source, setSource] = useState('anime');

  const handleExploreClick = () => {
    onExplore({ source, category, limit });
  };

  const isCartoons = source === 'cartoons';
  const cartoonCategories = isTmdbConfigured ? CARTOON_CATEGORIES : null;

  return (
    <div className="explore-section">
      <button
        type="button"
        className={`explore-toggle ${isOpen ? 'open' : ''} ${exploreMeta ? 'active' : ''}`}
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <SparklesIcon className="explore-toggle-icon" />
        <span>Explorar</span>
        {exploreMeta && <span className="explore-toggle-badge">Ativo</span>}
        {isOpen ? (
          <ChevronUpIcon className="explore-toggle-chevron" />
        ) : (
          <ChevronDownIcon className="explore-toggle-chevron" />
        )}
      </button>

      {isOpen && (
        <div className="explore-panel">
          <div className="explore-source-tabs">
            {EXPLORE_SOURCES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`explore-source-tab ${source === item.id ? 'selected' : ''}`}
                onClick={() => setSource(item.id)}
              >
                {item.id === 'anime' ? (
                  <FilmIcon className="w-4 h-4" />
                ) : (
                  <TvIcon className="w-4 h-4" />
                )}
                {item.label}
              </button>
            ))}
          </div>

          <div className="explore-panel-grid">
            <div className="explore-panel-block">
              <p className="explore-panel-label">Quantidade</p>
              <div className="explore-limit-group">
                {EXPLORE_LIMITS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`explore-chip ${limit === value ? 'selected' : ''}`}
                    onClick={() => setLimit(value)}
                  >
                    Top {value}
                  </button>
                ))}
              </div>
            </div>

            <div className="explore-panel-block explore-panel-block--categories">
              {isCartoons && !cartoonCategories ? (
                <>
                  <p className="explore-panel-label">Selecao curada</p>
                  <div className="explore-cartoons-info">
                    <p className="explore-cartoons-title">100 animacoes conhecidas</p>
                    <p className="explore-cartoons-desc">
                      Simpsons, SpongeBob, Avatar, Disney, Pixar, DreamWorks e mais —
                      lista fixa no app, detalhes via MyAnimeList/Jikan.
                    </p>
                    <span className="explore-cartoons-count">{CURATED_CARTOONS_TOTAL} titulos</span>
                  </div>
                </>
              ) : (
                <>
                  <p className="explore-panel-label">Categoria</p>
                  <div className="explore-category-list">
                    {(isCartoons ? cartoonCategories : EXPLORE_CATEGORIES).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`explore-category-btn ${category === item.id ? 'selected' : ''}`}
                        onClick={() => setCategory(item.id)}
                      >
                        <span className="explore-category-title">{item.label}</span>
                        <span className="explore-category-desc">{item.description}</span>
                      </button>
                    ))}
                  </div>
                  {isCartoons && cartoonCategories && (
                    <p className="explore-cartoons-desc" style={{ marginTop: '0.75rem' }}>
                      Dados via TMDB — animacao e desenhos ocidentais.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="explore-panel-actions">
            <button
              type="button"
              className="explore-apply-btn"
              onClick={handleExploreClick}
              disabled={loading}
            >
              {loading
                ? 'A carregar...'
                : isCartoons
                  ? `Ver ${limit} desenhos`
                  : `Ver Top ${limit}`}
            </button>
            {exploreMeta && (
              <button type="button" className="explore-clear-btn" onClick={onClearExplore}>
                <XMarkIcon className="w-4 h-4" />
                Voltar ao feed
              </button>
            )}
          </div>
        </div>
      )}

      {exploreMeta && !isOpen && (
        <div className="explore-active-bar">
          <span>
            A mostrar <strong>{exploreMeta.label}</strong> — Top {exploreMeta.limit}
          </span>
          <button type="button" onClick={onClearExplore}>
            Limpar
          </button>
        </div>
      )}
    </div>
  );
}

export default ExplorePanel;
