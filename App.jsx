import React, { useState, useEffect } from 'react';
import SearchBox from './components/SearchBox';
import AnimeDisplay from './components/AnimeDisplay';
import QuickSuggestions from './components/QuickSuggestions';
import Favorites from './components/Favorites';
import LoginModal from './components/LoginModal';
import MusicPlayer from './components/MusicPlayer';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useFavorites } from './hooks/useFavorites';
import { HandRaisedIcon } from '@heroicons/react/24/outline';
import './styles/App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentAnime, setCurrentAnime] = useState(null);
  const [resultsList, setResultsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historyStack, setHistoryStack] = useState([]);
  
  const [user, setUser] = useLocalStorage('nickelUser', null);
  const [showLoginModal, setShowLoginModal] = useState(!user);
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();

  const ANIME_DATABASE = {
    "death note": 1535,
    "attack on titan": 16498,
    "shingeki no kyojin": 16498,
    "naruto": 20,
    "one piece": 21,
    "bleach": 15,
    "demon slayer": 38000,
    "kimetsu no yaiba": 38000,
    "jujutsu kaisen": 40748,
    "code geass": 1575,
    "steins gate": 9253,
    "fullmetal alchemist": 121,
    "cowboy bebop": 1,
    "evangelion": 30,
    "monster": 19,
    "hunter x hunter": 136,
    "vinland saga": 37521,
    "spy x family": 50595,
    "chainsaw man": 44511,
    "one punch man": 30656,
    "sword art online": 25739,
    "no game no life": 33674,
    "haikyuu": 33096,
    "food wars": 32629,
    "oregairu": 27813,
    "silent voice": 56044,
    "koe no katachi": 56044
  };

  const isNumeric = (str) => !isNaN(str) && !isNaN(parseFloat(str));

  const calculateSimilarity = (str1, str2) => {
    const s1 = (str1 || "").toLowerCase();
    const s2 = (str2 || "").toLowerCase();

    if (s1 === s2) return 1.0;
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;

    let matches = 0;
    for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
      if (s1[i] === s2[i]) matches++;
    }
    return matches / Math.max(s1.length, s2.length);
  };

  const normalizeBaseTitle = (title) => {
    if (!title) return "";
    return title
      .toLowerCase()
      .replace(/\([^\)]*\)/g, " ")
      .replace(/season\s*\d+|\d+nd\s*season|\d+rd\s*season|\d+th\s*season/g, " ")
      .replace(/final\s*season|part\s*\d+|cour\s*\d+|\bii\b|\biii\b|\biv\b/g, " ")
      .replace(/\b\d+\b/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const getSeasonLabel = (title) => {
    if (!title) return "";
    const t = title.toLowerCase();
    if (t.match(/season\s*3|3rd\s*season|s\s*3|\bseason\s*iii\b|\biii\b/)) return "Season 3";
    if (t.match(/season\s*2|2nd\s*season|s\s*2|\bseason\s*ii\b|\bii\b/)) return "Season 2";
    return "";
  };

  const fetchSimilarByTitle = async (title, currentId) => {
    if (!title) return;

    try {
      const response = await fetch(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}`,
        { headers: { "Cache-Control": "no-cache" } }
      );
      const data = await response.json();

      if (!data || !Array.isArray(data.data)) return;

      const filtered = data.data.filter(a => {
        if (a.mal_id === currentId) return false;
        const base = normalizeBaseTitle(a.title || a.title_english || "");
        return base && (base.includes(title) || title.includes(base));
      });

      setResultsList(filtered.slice(0, 10));
    } catch (err) {
      console.error('Error fetching similar anime:', err);
    }
  };

  const fetchAnimeByQuery = async (query) => {
    setLoading(true);
    setError('');
    setResultsList([]);

    const q = String(query || "").trim();
    const qLower = q.toLowerCase();

    let url = "";
    if (ANIME_DATABASE[qLower]) {
      url = `https://api.jikan.moe/v4/anime/${ANIME_DATABASE[qLower]}`;
    } else if (isNumeric(q)) {
      url = `https://api.jikan.moe/v4/anime/${q}`;
    } else {
      url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}`;
    }

    try {
      const response = await fetch(url, {
        headers: { "Cache-Control": "no-cache" }
      });

      if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
      const data = await response.json();

      if (!data.data) throw new Error("No data in response");

      let selected = null;

      if (Array.isArray(data.data)) {
        if (data.data.length === 0) throw new Error("No anime found");

        const sorted = data.data
          .map(item => ({ item, score: calculateSimilarity(qLower, item.title) }))
          .sort((a, b) => b.score - a.score)
          .map(x => x.item);

        setResultsList(sorted.slice(0, 10));
        selected = sorted[0];
      } else {
        selected = data.data;
      }

      if (!currentAnime || currentAnime.mal_id !== selected.mal_id) {
        setHistoryStack(prev => [...prev, currentAnime].filter(Boolean));
      }

      setCurrentAnime(selected);

      const baseTitle = normalizeBaseTitle(selected.title || selected.title_english || "");
      fetchSimilarByTitle(baseTitle, selected.mal_id);
    } catch (err) {
      setError(err.message);
      setCurrentAnime(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    if (historyStack.length === 0) return;
    const newStack = [...historyStack];
    const prev = newStack.pop();
    setHistoryStack(newStack);
    setCurrentAnime(prev);
  };

  const handleLoginSave = (userData) => {
    setUser(userData);
    setShowLoginModal(false);
  };

  const handleToggleFavorite = () => {
    if (!currentAnime) return;
    if (isFavorite(currentAnime.mal_id)) {
      removeFavorite(currentAnime.mal_id);
    } else {
      addFavorite(currentAnime);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <img className="app-logo" src="nickyLogov2png.png" alt="Nicky Anime Logo" />
        <h1 className="app-title">Nicky Anime</h1>

        <p className="subtitle">
          Pesquisa o teu anime pelo nome e guarda os teus favoritos na lista abaixo.
        </p>

        {user && user.name && (
          <p className="user-greeting">
            Olá, {user.name}!{' '}
            <HandRaisedIcon className="w-4 h-4 inline-block align-text-bottom" aria-hidden="true" />
          </p>
        )}

        <SearchBox
          onSearch={fetchAnimeByQuery}
          onGoBack={handleGoBack}
          canGoBack={historyStack.length > 0}
        />

        <QuickSuggestions onSelectAnime={fetchAnimeByQuery} />

        <AnimeDisplay
          anime={currentAnime}
          loading={loading}
          error={error}
          isFavorited={currentAnime ? isFavorite(currentAnime.mal_id) : false}
          onToggleFavorite={handleToggleFavorite}
          resultsList={resultsList}
          onSelectAnime={fetchAnimeByQuery}
        />

        <Favorites
          favorites={favorites}
          userName={user?.name}
          onSelectAnime={fetchAnimeByQuery}
          onRemoveFavorite={removeFavorite}
        />
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onSave={handleLoginSave}
        onSkip={() => setShowLoginModal(false)}
      />

      <MusicPlayer />
    </div>
  );
}

export default App;
