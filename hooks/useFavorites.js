import { useLocalStorage } from './useLocalStorage';

export const useFavorites = () => {
  const [favorites, setFavorites] = useLocalStorage('animeFavorites', []);

  const isFavorite = (id) => {
    return favorites.some(a => a.mal_id === id);
  };

  const addFavorite = (anime) => {
    if (!anime || isFavorite(anime.mal_id)) return;

    const newFav = {
      mal_id: anime.mal_id,
      title: anime.title || anime.title_english || "Sem título",
      image: anime.images?.jpg?.small_image_url || ""
    };

    setFavorites([newFav, ...favorites]);
  };

  const removeFavorite = (id) => {
    setFavorites(favorites.filter(a => a.mal_id !== id));
  };

  return { favorites, addFavorite, removeFavorite, isFavorite };
};
