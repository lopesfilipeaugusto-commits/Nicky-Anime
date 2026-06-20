import { useLocalStorage } from './useLocalStorage';

const getAnimeListItem = (anime) => {
  return {
    mal_id: anime.mal_id,
    title: anime.title || anime.title_english || 'Sem titulo',
    image:
      anime.images?.webp?.large_image_url ||
      anime.images?.jpg?.large_image_url ||
      anime.images?.webp?.image_url ||
      anime.images?.jpg?.image_url ||
      anime.images?.jpg?.small_image_url ||
      ''
  };
};

const normalizeLists = (lists) => {
  if (!Array.isArray(lists)) return [];

  return lists.map((list) => {
    let id = list?.id;
    // Se id for null, undefined, NaN ou não for número válido, gerar novo
    if (id == null || isNaN(Number(id))) {
      id = Date.now() + Math.random();
    } else {
      id = Number(id);
    }

    return {
      id,
      name: String(list?.name || 'Lista sem nome'),
      items: Array.isArray(list?.items) ? list.items : []
    };
  });
};

export const useAnimeLists = () => {
  const [storedLists, setLists] = useLocalStorage('animeLists', []);
  const lists = normalizeLists(storedLists);

  const createList = (name) => {
    const trimmedName = String(name || '').trim();
    if (!trimmedName) return { ok: false, reason: 'invalid_name' };

    const alreadyExists = lists.some(
      (list) => list.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (alreadyExists) return { ok: false, reason: 'duplicate_name' };

    const newList = {
      id: Date.now() + Math.random(),
      name: trimmedName,
      items: []
    };

    setLists((prev) => [newList, ...normalizeLists(prev)]);
    return { ok: true, list: newList };
  };

  const removeList = (id) => {
    setLists((prev) => normalizeLists(prev).filter((list) => list.id !== id));
  };

  const addAnimeToList = (listId, anime) => {
    if (!anime?.mal_id) return { ok: false, reason: 'invalid_anime' };

    const targetList = lists.find((list) => list.id === listId);
    if (!targetList) return { ok: false, reason: 'missing_list' };

    const alreadyInList = targetList.items.some(
      (item) => item.mal_id === anime.mal_id
    );
    if (alreadyInList) return { ok: false, reason: 'duplicate_anime' };

    setLists((prev) => {
      const normalized = normalizeLists(prev);
      return normalized.map((list) =>
        list.id === listId
          ? { ...list, items: [getAnimeListItem(anime), ...list.items] }
          : list
      );
    });

    return { ok: true };
  };

  const removeAnimeFromList = (listId, animeId) => {
    setLists((prev) => {
      const normalized = normalizeLists(prev);
      return normalized.map((list) =>
        list.id === listId
          ? { ...list, items: list.items.filter((item) => item.mal_id !== animeId) }
          : list
      );
    });
  };

  return {
    lists,
    createList,
    removeList,
    addAnimeToList,
    removeAnimeFromList
  };
};
