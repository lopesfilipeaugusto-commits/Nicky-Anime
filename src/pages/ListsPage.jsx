import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useAnimeLists } from '../hooks/useAnimeLists';
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
    navigate('/lists');
  };

  const handleCreateListKeyPress = (e) => {
    if (e.key === 'Enter') handleCreateList();
  };

  return (
    <div className="favorites-page-container">
      <div className="favorites-page-header">
        <button className="back-button" onClick={handleGoBack}>
          Voltar
        </button>
        <h1 className="favorites-page-title">As Minhas Listas</h1>
        <div className="favorites-page-spacer"></div>
      </div>

      <div className="favorites-page-content">
        <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            className="favorite-card-btn view-btn"
            onClick={() => navigate('/')}
            style={{ padding: '10px 18px' }}
          >
            Procurar mais animes
          </button>
          <button
            className="favorite-card-btn view-btn"
            onClick={() => {
              document.getElementById('new-list-form')?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ padding: '10px 18px' }}
          >
            Criar nova lista
          </button>
        </div>

        <div id="new-list-form" style={{ marginBottom: '24px', padding: '20px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
          <p style={{ margin: '0 0 12px 0', color: '#ddd', fontSize: '16px' }}>Nomeie e crie uma nova lista:</p>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={newListName}
              onChange={(e) => {
                setNewListName(e.target.value);
                if (listError) setListError('');
              }}
              onKeyDown={handleCreateListKeyPress}
              placeholder="Nome da nova lista"
              style={{
                flex: '1 1 200px',
                padding: '10px 14px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '15px'
              }}
            />
            <button className="favorite-card-btn view-btn" style={{ padding: '10px 18px' }} onClick={handleCreateList}>
              Criar lista
            </button>
          </div>
          {listError && <p style={{ color: '#ff6b6b', margin: '10px 0 0 0', fontSize: '14px' }}>{listError}</p>}
        </div>

        {lists.length === 0 ? (
          <div className="no-favorites">
            <p>Sem listas ainda.</p>
            <p className="no-favorites-subtitle">Cria uma lista aqui em cima. — sem precisar de login!</p>
          </div>
        ) : (
          lists.map((list) => (
            <div key={list.id} style={{ marginBottom: '26px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '14px',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}
              >
                <h2 style={{ margin: 0 }}>{list.name}</h2>
                <button className="favorite-card-btn remove-btn" onClick={() => removeList(list.id)}>
                  Remover Lista
                </button>
              </div>

              {list.items.length === 0 ? (
                <div className="no-favorites">
                  <p>Sem animes nesta lista.</p>
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
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}

export default ListsPage;
