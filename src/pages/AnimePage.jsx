// ============================================
// --- AUTHENTICATION: AnimePage (ATUALIZADO) ---
// ============================================
// Pode pesquisar animes sem login, mas só mostra seções de perfil/favoritos se autenticado
// Mostra modal de login automático na primeira visita se não houver currentUser
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AnimeFeed from '../components/AnimeFeed';
import AnimeDisplay from '../components/AnimeDisplay';
import LoginModal from '../components/LoginModal';
import SelectListModal from '../components/SelectListModal';
import MusicPlayer from '../components/MusicPlayer';
import BottomNav from '../components/BottomNav';
import { useFavorites } from '../hooks/useFavorites';
import { useAnimeLists } from '../hooks/useAnimeLists';
import { useAuth } from '../context/AuthContext';
import { ExclamationTriangleIcon, FilmIcon } from '@heroicons/react/24/outline';
import '../styles/App.css';

// Avatar de foto do Google — aparece ao lado do nome do usuário no cabeçalho
const GoogleProfilePic = ({ photoURL }) => {
  if (!photoURL) return null;

  return (
    <img
      src={photoURL}
      alt="Foto de perfil"
      style={{
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '2px solid rgba(255,255,255,0.8)',
        flexShrink: 0
      }}
    />
  );
};

const ANIME_DATABASE = {
  'death note': 1535,
  'attack on titan': 16498,
  'shingeki no kyojin': 16498,
  'naruto': 20,
  'one piece': 21,
  'bleach': 15,
  'demon slayer': 38000,
  'kimetsu no yaiba': 38000,
  'jujutsu kaisen': 40748,
  'code geass': 1575,
  'steins gate': 9253,
  'fullmetal alchemist': 121,
  'cowboy bebop': 1,
  'evangelion': 30,
  'monster': 19,
  'hunter x hunter': 136,
  'vinland saga': 37521,
  'spy x family': 50595,
  'chainsaw man': 44511,
  'one punch man': 30656,
  'sword art online': 25739,
  'no game no life': 33674,
  'haikyuu': 33096,
  'food wars': 32629,
  'oregairu': 27813,
  'silent voice': 56044,
  'koe no katachi': 56044
};

const isNumeric = (str) => !isNaN(str) && !isNaN(parseFloat(str));

const calculateSimilarity = (str1, str2) => {
  const s1 = (str1 || '').toLowerCase();
  const s2 = (str2 || '').toLowerCase();

  if (s1 === s2) return 1.0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;

  let matches = 0;
  for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
    if (s1[i] === s2[i]) matches++;
  }
  return matches / Math.max(s1.length, s2.length);
};

const normalizeBaseTitle = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/season\s*\d+|\d+nd\s*season|\d+rd\s*season|\d+th\s*season/g, ' ')
    .replace(/final\s*season|part\s*\d+|cour\s*\d+|\bii\b|\biii\b|\biv\b/g, ' ')
    .replace(/\b\d+\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

function AnimePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lastRequestedIdRef = useRef(null);
  const [currentAnime, setCurrentAnime] = useState(null);
  const [resultsList, setResultsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historyStack, setHistoryStack] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false); // Só mostra se não autenticado
  const [showSelectListModal, setShowSelectListModal] = useState(false);

  const { currentUser } = useAuth(); // Firebase user substitui localStorage user
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { lists, addAnimeToList, createList } = useAnimeLists();

  // --- NOVO: Estado e Lógica para a Timeline Infinita (Top Animes) ---
  const [feedAnimes, setFeedAnimes] = useState([]);
  const [feedPage, setFeedPage] = useState(1);
  const [hasMoreFeed, setHasMoreFeed] = useState(true);
  const isFetchingRef = useRef(false);

  const loadFeedAnimes = useCallback(async () => {
    if (isFetchingRef.current || !hasMoreFeed) return;
    isFetchingRef.current = true;
    try {
      const response = await fetch(`https://api.jikan.moe/v4/top/anime?page=${feedPage}`);
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }
      const data = await response.json();
      if (data.data) {
        setFeedAnimes((prev) => {
          const newAnimes = data.data.filter((newA) => !prev.some((p) => p.mal_id === newA.mal_id));
          return [...prev, ...newAnimes];
        });
        setFeedPage((p) => p + 1);
        setHasMoreFeed(data.pagination?.has_next_page ?? false);
      }
    } catch (err) {
      console.error('Erro a carregar feed:', err);
      setError('Nao foi possivel carregar os animes. Tenta novamente daqui a pouco.');
    } finally {
      isFetchingRef.current = false;
    }
  }, [feedPage, hasMoreFeed]);

  const fetchSimilarByTitle = useCallback(async (title, currentId) => {
    if (!title) return;

    try {
      const response = await fetch(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}`,
        { headers: { 'Cache-Control': 'no-cache' } }
      );

      if (!response.ok) return;

      const data = await response.json();

      if (!data || !Array.isArray(data.data)) return;

      const filtered = data.data.filter((anime) => {
        if (anime.mal_id === currentId) return false;
        const base = normalizeBaseTitle(anime.title || anime.title_english || '');
        return base && (base.includes(title) || title.includes(base));
      });

      setResultsList(filtered.slice(0, 10));
    } catch (err) {
      console.error('Error fetching similar anime:', err);
    }
  }, []);

  const fetchAnimeByQuery = useCallback(async (query) => {
    setLoading(true);
    setError('');
    setResultsList([]);
    setHasSearched(true);

    const q = String(query || '').trim();
    const qLower = q.toLowerCase();

    let url = '';
    if (ANIME_DATABASE[qLower]) {
      url = `https://api.jikan.moe/v4/anime/${ANIME_DATABASE[qLower]}`;
    } else if (isNumeric(q)) {
      url = `https://api.jikan.moe/v4/anime/${q}`;
    } else {
      url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}`;
    }

    try {
      const response = await fetch(url, {
        headers: { 'Cache-Control': 'no-cache' }
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Muitos pedidos seguidos. Espera alguns segundos e tenta novamente.');
        }
        throw new Error(`HTTP Error ${response.status}`);
      }
      const data = await response.json();

      if (!data.data) throw new Error('No data in response');

      let selected = null;

      if (Array.isArray(data.data)) {
        if (data.data.length === 0) throw new Error('No anime found');

        const sorted = data.data
          .map((item) => ({
            item,
            score: Math.max(
              calculateSimilarity(qLower, item.title),
              calculateSimilarity(qLower, item.title_english || '')
            ),
          }))
          .sort((a, b) => b.score - a.score)
          .map((entry) => entry.item);

        setResultsList(sorted.slice(0, 10));
        selected = sorted[0];
      } else {
        selected = data.data;
        setResultsList([selected]);
      }

      setCurrentAnime((previousAnime) => {
        if (!previousAnime || previousAnime.mal_id !== selected.mal_id) {
          setHistoryStack((prev) => [...prev, previousAnime].filter(Boolean));
        }
        return selected;
      });

      const baseTitle = normalizeBaseTitle(selected.title || selected.title_english || '');
      fetchSimilarByTitle(baseTitle, selected.mal_id);
    } catch (err) {
      setError(err.message);
      setCurrentAnime(null);
    } finally {
      setLoading(false);
    }
  }, [fetchSimilarByTitle]);

  const handleSelectAnime = useCallback((queryOrId) => {
    const value = String(queryOrId ?? '').trim();
    if (!value) return;

    if (isNumeric(value)) {
      lastRequestedIdRef.current = value;
      navigate(`/?id=${value}`, { replace: true });
    }

    fetchAnimeByQuery(value);
  }, [fetchAnimeByQuery, navigate]);

  const handleBackToFeed = useCallback(() => {
    setCurrentAnime(null);
    setHasSearched(false);
    setResultsList([]);
    setError('');
    lastRequestedIdRef.current = null;
    navigate('/', { replace: true });
  }, [navigate]);

  const handleGoBack = () => {
    if (historyStack.length === 0) {
      handleBackToFeed();
      return;
    }
    const newStack = [...historyStack];
    const previousAnime = newStack.pop();
    setHistoryStack(newStack);
    setCurrentAnime(previousAnime);
    if (previousAnime?.mal_id) {
      lastRequestedIdRef.current = String(previousAnime.mal_id);
      navigate(`/?id=${previousAnime.mal_id}`, { replace: true });
    }
  };

  const handleAddToList = (animeObj) => {
    const targetAnime = animeObj?.mal_id ? animeObj : currentAnime;
    if (!targetAnime) return;
    setCurrentAnime(targetAnime); // Guarda qual o anime selecionado para o Modal saber

    if (lists.length === 0) {
      window.alert('Ainda nao tens listas criadas. Vai a Listas para dar nome a uma lista primeiro.');
      navigate('/lists');
      return;
    }

    setShowSelectListModal(true);
  };

  const handleSelectList = (selectedList) => {
    setShowSelectListModal(false);
    
    if (!selectedList || !currentAnime) return;

    const result = addAnimeToList(selectedList.id, currentAnime);

    if (!result.ok) {
      if (result.reason === 'duplicate_anime') {
        window.alert('Esse anime ja esta nessa lista.');
        return;
      }

      window.alert('Nao deu para adicionar esse anime agora. Tenta outra vez daqui a pouco.');
      return;
    }

    window.alert(`Boa! O anime foi adicionado a lista "${selectedList.name}".`);
  };

  const handleCreateListFromModal = (listName) => {
    return createList(listName);
  };

  const handleToggleFavorite = (animeObj) => {
    const targetAnime = animeObj?.mal_id ? animeObj : currentAnime;
    if (!targetAnime) return;
    if (isFavorite(targetAnime.mal_id)) {
      removeFavorite(targetAnime.mal_id);
    } else {
      addFavorite(targetAnime);
    }
  };

  const handleLoginSkip = () => {
    setShowLoginModal(false);
  };

  const handleOpenLogin = () => {
    setShowLoginModal(true);
  };

  // Carrega a Timeline pela primeira vez (SÓ UMA VEZ)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!hasSearched && feedAnimes.length === 0 && !isFetchingRef.current) {
      loadFeedAnimes();
    }
  }, []); // Dependências vazias = executa apenas na montagem

  // Carrega anime específico via query parameters
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const animeId = searchParams.get('id');
    const parsedAnimeId = Number(animeId);

    if (
      animeId &&
      currentAnime?.mal_id !== parsedAnimeId &&
      lastRequestedIdRef.current !== animeId
    ) {
      lastRequestedIdRef.current = animeId;
      fetchAnimeByQuery(animeId);
    }
  }, [searchParams, currentAnime?.mal_id, fetchAnimeByQuery]);

  return (
    <div className="app">
      {/* --- CABEÇALHO COM PERFIL E AÇÕES --- */}
      <div className="app-header">
        <div className="header-left">
          {(historyStack.length > 0 || currentAnime) && (
            <button 
              className="header-btn header-back-btn" 
              onClick={handleGoBack}
              title="Voltar"
            >
              ← Voltar
            </button>
          )}
        </div>

        <div className="header-center">
          <h1 className="header-title">
            <FilmIcon className="w-5 h-5 inline-block align-text-bottom mr-2" />
            NickyAnime
          </h1>
        </div>

        <div className="header-right">
          {currentUser ? (
            <div className="user-profile-header">
              <GoogleProfilePic photoURL={currentUser.photoURL} />
              <span className="user-name">{currentUser.displayName || 'Utilizador'}</span>
            </div>
          ) : (
            <button 
              className="header-btn header-login-btn" 
              onClick={handleOpenLogin}
            >
              Entrar
            </button>
          )}
        </div>
      </div>

      {/* --- INDICADORES DE LOADING E ERRO --- */}
      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>A carregar anime...</p>
        </div>
      )}

      {error && (
        <div className="error-indicator">
          <p>
            <ExclamationTriangleIcon className="w-5 h-5 inline-block align-text-bottom mr-2" />
            {error}
          </p>
          <button onClick={() => setError('')}>Fechar</button>
        </div>
      )}

      {currentAnime && (
        <div className="container w-full max-w-3xl">
          <AnimeDisplay
            anime={currentAnime}
            loading={loading}
            error={error}
            isFavorited={isFavorite(currentAnime.mal_id)}
            onToggleFavorite={() => handleToggleFavorite(currentAnime)}
            onAddToList={() => handleAddToList(currentAnime)}
            resultsList={resultsList.filter((item) => item.mal_id !== currentAnime.mal_id)}
            onSelectAnime={handleSelectAnime}
            onBackToFeed={handleBackToFeed}
          />
        </div>
      )}

      {!currentAnime && (
        <AnimeFeed
          animes={hasSearched ? resultsList : feedAnimes}
          loading={!hasSearched && feedAnimes.length === 0}
          onSelectAnime={handleSelectAnime}
          onToggleFavorite={handleToggleFavorite}
          onAddToList={handleAddToList}
          onLoadMore={hasSearched ? null : loadFeedAnimes}
          hasMore={hasSearched ? false : hasMoreFeed}
          onSearch={fetchAnimeByQuery}
          onClearSearch={handleBackToFeed}
        />
      )}

      <LoginModal
        isOpen={showLoginModal}
        onSkip={handleLoginSkip}
      />

      <SelectListModal
        isOpen={showSelectListModal}
        lists={lists}
        onSelect={handleSelectList}
        onCancel={() => setShowSelectListModal(false)}
        animeTitle={currentAnime?.title || 'Anime'}
        onCreateList={handleCreateListFromModal}
      />

      <BottomNav />
      <MusicPlayer />
    </div>
  );
}

export default AnimePage;
