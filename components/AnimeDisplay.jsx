import React from 'react';
import { VideoCameraIcon } from '@heroicons/react/24/outline';

function AnimeDisplay({ 
  anime, 
  loading, 
  error, 
  isFavorited, 
  onToggleFavorite,
  resultsList,
  onSelectAnime
}) {
  const getSeasonLabel = (title) => {
    if (!title) return "";
    const t = title.toLowerCase();
    if (t.match(/season\s*3|3rd\s*season|s\s*3|\bseason\s*iii\b|\biii\b/)) return "Season 3";
    if (t.match(/season\s*2|2nd\s*season|s\s*2|\bseason\s*ii\b|\bii\b/)) return "Season 2";
    return "";
  };

  const renderContent = () => {
    if (loading) {
      return <p className="empty-state">Carregando...</p>;
    }

    if (error) {
      return (
        <p className="error">
          <strong>Erro na busca:</strong> {error}<br />
          <small>Tenta outro anime ou verifica a grafia</small>
        </p>
      );
    }

    if (!anime) {
      return (
        <p className="empty-state">
          Pesquisa um anime para ver detalhes{' '}
          <VideoCameraIcon className="w-4 h-4 inline-block align-text-bottom" aria-hidden="true" />
        </p>
      );
    }

    const seasonLabel = getSeasonLabel(anime.title);
    const titleEnglish = anime.title_english || "N/A";

    return (
      <>
        <h2 id="title">
          {anime.title}
          {seasonLabel && <span className="season-label"> {seasonLabel}</span>}
        </h2>

        {titleEnglish && titleEnglish !== "N/A" && (
          <p style={{ color: '#999', marginBottom: '15px', fontStyle: 'italic' }}>
            {titleEnglish}
          </p>
        )}

        {anime.images?.jpg?.large_image_url && (
          <img 
            id="image"
            src={anime.images.jpg.large_image_url}
            alt={anime.title}
            onError={(e) => e.target.style.display = 'none'}
          />
        )}

        <p id="synopsis">
          {anime.synopsis || "Sinopse não disponível"}
        </p>

        <div style={{ marginTop: '12px' }}>
          <button 
            className={`fav-btn ${isFavorited ? 'fav-remove' : 'fav-open'}`}
            onClick={onToggleFavorite}
          >
            {isFavorited ? '★ Remover dos favoritos' : '☆ Guardar nos favoritos'}
          </button>
        </div>
      </>
    );
  };

  return (
    <>
      <div className="anime-info" id="animeInfo">
        {renderContent()}
      </div>

      {resultsList.length > 0 && (
        <div className="results">
          {resultsList.map((item) => {
            const seasonLabel = getSeasonLabel(item.title);
            const year = item.year ? ` (${item.year})` : "";

            return (
              <div key={item.mal_id} className="result-item">
                <img 
                  className="result-thumb"
                  src={item.images?.jpg?.small_image_url || ''}
                  alt={item.title}
                  onError={(e) => e.target.style.display = 'none'}
                />
                <div>
                  <div>
                    <strong>{item.title}</strong>
                    {seasonLabel && (
                      <span style={{ color: '#667eea', fontSize: '12px', marginLeft: '8px' }}>
                        {seasonLabel}
                      </span>
                    )}
                    {year}
                  </div>
                  <div style={{ color: '#888', fontSize: '12px' }}>
                    {item.title_english || ''}
                  </div>
                </div>
                <button 
                  className="result-btn"
                  onClick={() => onSelectAnime(item.mal_id)}
                >
                  Ver
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default AnimeDisplay;
