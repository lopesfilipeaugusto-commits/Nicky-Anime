import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useAnimeLists } from '../hooks/useAnimeLists';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import BrandLogo from '../components/BrandLogo';
import '../styles/AccountPages.css';
import '../styles/FavoritesPage.css';

function ListsPage() {
  const navigate = useNavigate();
  const { lists, removeList, removeAnimeFromList, createList } = useAnimeLists();
  const [newListName, setNewListName] = useState('');
  const [listError, setListError] = useState('');

  const handleGoBack = () => {
    navigate('/');
  };

  const handleSelectAnime = (animeId) => {
    navigate(`/?id=${animeId}`);
  };

  const handleCreateList = () => {
    const result = createList(newListName);

    if (!result.ok) {
      if (result.reason === 'duplicate_name') {
        setListError('Ja tens uma lista com esse nome. Escolhe outro.');
        return;
      }
      setListError('Escreve um nome valido para a tua lista.');
      return;
    }

    setNewListName('');
    setListError('');
  };

  const handleCreateListKeyPress = (event) => {
    if (event.key === 'Enter') handleCreateList();
  };

  const scrollToCreateForm = () => {
    document.getElementById('new-list-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="account-page">
      <header className="account-page-header">
        <button type="button" className="account-back-button" onClick={handleGoBack}>
          ← Voltar
        </button>
        <div className="account-page-title-row">
          <BrandLogo size="xs" iconOnly />
          <h1 className="account-page-title">As Minhas Listas</h1>
        </div>
        <div className="account-page-header-spacer" aria-hidden="true" />
      </header>

      <div className="account-page-content">
        <div className="account-toolbar">
          <button type="button" className="account-btn account-btn-ghost" onClick={() => navigate('/')}>
            <MagnifyingGlassIcon />
            Procurar animes
          </button>
          <button type="button" className="account-btn account-btn-primary" onClick={scrollToCreateForm}>
            <PlusIcon />
            Nova lista
          </button>
        </div>

        <section id="new-list-form" className="account-card account-card-highlight">
          <div className="account-card-header">
            <div className="account-card-icon">
              <PlusIcon />
            </div>
            <div>
              <h2 className="account-card-heading">Criar nova lista</h2>
              <p className="account-card-subtitle">
                Escolhe um nome claro — depois adiciona animes a partir do feed ou da pesquisa.
              </p>
            </div>
          </div>

          <div className="account-form-row">
            <input
              className="account-input"
              type="text"
              value={newListName}
              onChange={(event) => {
                setNewListName(event.target.value);
                if (listError) setListError('');
              }}
              onKeyDown={handleCreateListKeyPress}
              placeholder="Ex: Para ver este fim de semana"
            />
            <button type="button" className="account-btn account-btn-primary" onClick={handleCreateList}>
              <PlusIcon />
              Criar lista
            </button>
          </div>
          {listError && <p className="account-error">{listError}</p>}
        </section>

        {lists.length === 0 ? (
          <div className="account-empty-state">
            <p>Sem listas ainda.</p>
            <p className="account-empty-state-subtitle">
              Cria a tua primeira lista no formulario acima — sem precisar de login.
            </p>
          </div>
        ) : (
          lists.map((list) => (
            <section key={list.id} className="account-card list-section">
              <div className="list-section-header">
                <div className="list-section-title-wrap">
                  <h2 className="list-section-title">{list.name}</h2>
                  <span className="list-count-badge">
                    {list.items.length} anime{list.items.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <button
                  type="button"
                  className="account-btn account-btn-ghost"
                  onClick={() => removeList(list.id)}
                >
                  <TrashIcon />
                  Remover
                </button>
              </div>

              {list.items.length === 0 ? (
                <div className="list-section-empty">
                  Sem animes nesta lista. Vai ao feed e clica em &quot;Lista&quot; num anime.
                </div>
              ) : (
                <div className="favorites-grid">
                  {list.items.map((anime) => (
                    <div key={`${list.id}-${anime.mal_id}`} className="favorite-card">
                      <div
                        className="favorite-card-image-wrapper"
                        onClick={() => handleSelectAnime(anime.mal_id)}
                      >
                        {anime.image ? (
                          <img
                            className="favorite-card-image"
                            src={anime.image}
                            alt={anime.title}
                            onError={(event) => {
                              event.target.style.display = 'none';
                              event.target.parentElement.innerHTML = '<div class="image-placeholder">Anime</div>';
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
                            type="button"
                            className="favorite-card-btn view-btn"
                            onClick={() => handleSelectAnime(anime.mal_id)}
                          >
                            Ver
                          </button>
                          <button
                            type="button"
                            className="favorite-card-btn remove-btn"
                            onClick={() => removeAnimeFromList(list.id, anime.mal_id)}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}

export default ListsPage;
