import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import BrandLogo from '../components/BrandLogo';
import { useFavorites } from '../hooks/useFavorites';
import { fetchAnimeById, getAnimeImage } from '../services/jikanApi';
import '../styles/AccountPages.css';
import '../styles/FavoritesPage.css';

function FavoritesPage() {
  const navigate = useNavigate();
  const { favorites, removeFavorite, updateFavoriteImage } = useFavorites();

  const handleGoBack = () => {
    navigate('/');
  };

  const handleSelectAnime = (animeId) => {
    navigate(`/?id=${animeId}`);
  };

  useEffect(() => {
    let isCancelled = false;

    const refreshFavoriteImages = async () => {
      const favoritesToRefresh = favorites.filter(
        (anime) => anime.mal_id > 0 && anime.imageQuality !== 'large'
      );

      for (const anime of favoritesToRefresh) {
        if (isCancelled) break;

        try {
          const animeData = await fetchAnimeById(anime.mal_id, { silent: true });
          const highQualityImage = getAnimeImage(animeData);

          if (highQualityImage && highQualityImage !== anime.image) {
            updateFavoriteImage(anime.mal_id, highQualityImage);
          }
        } catch (error) {
          console.error('Error updating favorite image:', error);
        }
      }
    };

    if (favorites.length > 0) {
      refreshFavoriteImages();
    }

    return () => {
      isCancelled = true;
    };
  }, [favorites, updateFavoriteImage]);

  return (
    <div className="account-page">
      <header className="account-page-header">
        <button type="button" className="account-back-button" onClick={handleGoBack}>
          ← Voltar
        </button>
        <div className="account-page-title-row">
          <BrandLogo size="xs" iconOnly />
          <h1 className="account-page-title">Favoritos</h1>
        </div>
        <div className="account-page-header-spacer" aria-hidden="true" />
      </header>

      <div className="account-page-content favorites-page-content">
        {favorites.length === 0 ? (
          <div className="no-favorites">
            <p>Sem favoritos ainda.</p>
            <p className="no-favorites-subtitle">Adiciona animes aos teus favoritos!</p>
          </div>
        ) : (
          <div className="favorites-grid">
            {favorites.map((anime) => (
              <div key={anime.mal_id} className="favorite-card">
                <div
                  className="favorite-card-image-wrapper"
                  onClick={() => handleSelectAnime(anime.mal_id)}
                >
                  {anime.image ? (
                    <img
                      className="favorite-card-image"
                      src={anime.image}
                      alt={anime.title}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="image-placeholder">Anime</div>';
                      }}
                    />
                  ) : (
                    <div className="image-placeholder">Anime</div>
                  )}
                </div>
                <div className="favorite-card-content">
                  <h3
                    className="favorite-card-title"
                    onClick={() => handleSelectAnime(anime.mal_id)}
                  >
                    {anime.title}
                  </h3>
                  <div className="favorite-card-actions">
                    <button
                      className="favorite-card-btn view-btn"
                      onClick={() => handleSelectAnime(anime.mal_id)}
                    >
                      Ver
                    </button>
                    <button
                      className="favorite-card-btn remove-btn"
                      onClick={() => removeFavorite(anime.mal_id)}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

export default FavoritesPage;
