import React, { useState } from 'react';

function Favorites({ favorites, userName, onSelectAnime, onRemoveFavorite }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`favorites ${isCollapsed ? 'collapsed' : ''}`} id="favorites">
      <h2>
        Favoritos {userName && <span id="favoritesOwner">de {userName}</span>}
        <button 
          id="favToggle" 
          className="fav-toggle"
          onClick={toggleCollapsed}
        >
          {isCollapsed ? 'Mostrar' : 'Ocultar'}
        </button>
      </h2>
      <div className="fav-list" id="favoritesList">
        {favorites.length === 0 ? (
          <small style={{ color: '#999' }}>Sem favoritos ainda.</small>
        ) : (
          favorites.map((anime) => (
            <div key={anime.mal_id} className="fav-item">
              <img 
                className="fav-thumb"
                src={anime.image}
                alt={anime.title}
                onError={(e) => e.target.style.display = 'none'}
              />
              <div>{anime.title}</div>
              <div className="fav-actions">
                <button 
                  className="fav-btn fav-open"
                  onClick={() => onSelectAnime(anime.mal_id)}
                >
                  Ver
                </button>
                <button 
                  className="fav-btn fav-remove"
                  onClick={() => onRemoveFavorite(anime.mal_id)}
                >
                  Remover
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Favorites;
