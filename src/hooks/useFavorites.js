import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const getFavoriteImage = (anime) => {
  return (
    anime.images?.webp?.large_image_url ||
    anime.images?.jpg?.large_image_url ||
    anime.images?.webp?.image_url ||
    anime.images?.jpg?.image_url ||
    anime.images?.jpg?.small_image_url ||
    ''
  );
};

export const useFavorites = () => {
  const [favorites, setFavorites] = useLocalStorage('animeFavorites', []);

  const isFavorite = (id) => {
    return favorites.some(a => a.mal_id === id);
  };

  const addFavorite = (anime) => {
    if (!anime || isFavorite(anime.mal_id)) return;

    const newFav = {
      mal_id: anime.mal_id,
      title: anime.title || anime.title_english || 'Sem titulo',
      image: getFavoriteImage(anime),
      imageQuality: 'large'
    };

    setFavorites([newFav, ...favorites]);
  };

  const updateFavoriteImage = useCallback((id, image) => {
    setFavorites((prev) =>
      prev.map((favorite) =>
        favorite.mal_id === id
          ? { ...favorite, image, imageQuality: 'large' }
          : favorite
      )
    );
  }, [setFavorites]);

  const removeFavorite = (id) => {
    setFavorites(favorites.filter(a => a.mal_id !== id));
  };

  return { favorites, addFavorite, removeFavorite, isFavorite, updateFavoriteImage };
};
