// Importa a biblioteca React e o hook useState (usado para gerenciar estado)
import React, { useState } from 'react';

// Componente funcional Favorites que recebe props (propriedades) do componente pai
// Parâmetros:
// - favorites: array com lista de animes favoritos
// - userName: nome do usuário logado
// - onSelectAnime: função callback para quando clica em "Ver" um anime
// - onRemoveFavorite: função callback para quando clica em "Remover" um anime
function Favorites({ favorites, userName, onSelectAnime, onRemoveFavorite }) {
  
  // Hook useState: cria uma variável de estado isCollapsed (se deve esconder/mostrar favoritos)
  // isCollapsed: valor atual do estado (false = mostrado, true = escondido)
  // setIsCollapsed: função para atualizar o estado
  // useState(false): inicializa com valor false (começa mostrando os favoritos)
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Função que inverte o estado de isCollapsed (se estava false vira true e vice-versa)
  // Isso é chamada quando o user clica no botão "Mostrar/Ocultar"
  const toggleCollapsed = () => {
    // ! (negação) inverte o valor booleano
    setIsCollapsed(!isCollapsed);
  };

  // Retorna o JSX (HTML em JavaScript) que será renderizado na tela
  return (
    // Div principal com classe dinâmica: se isCollapsed for true, adiciona classe "collapsed"
    <div className={`favorites ${isCollapsed ? 'collapsed' : ''}`} id="favorites">
      
      {/* Título da seção de favoritos */}
      <h2>
        {/* Texto "Favoritos" */}
        Favoritos {
          /* Condicional: se userName existe, mostra "de [nome do usuário]" */
          userName && <span id="favoritesOwner">de {userName}</span>
        }
        
        {/* Botão para mostrar/ocultar a lista de favoritos */}
        <button 
          id="favToggle" 
          className="fav-toggle"
          // onClick: evento que é acionado quando clica no botão
          // Chama a função toggleCollapsed para inverter o estado
          onClick={toggleCollapsed}
        >
          {/* Renderiza "Mostrar" ou "Ocultar" baseado no estado isCollapsed */}
          {isCollapsed ? 'Mostrar' : 'Ocultar'}
        </button>
      </h2>
      
      {/* Container da lista de favoritos */}
      <div className="fav-list" id="favoritesList">
        
        {/* Condicional ternária: verifica se há favoritos */}
        {favorites.length === 0 ? (
          // Se não tem favoritos (length === 0), mostra mensagem
          <small style={{ color: '#999' }}>Sem favoritos ainda.</small>
        ) : (
          // Se tem favoritos, usa .map() para renderizar cada um
          // .map(): função que transforma cada item do array em um elemento JSX
          // (anime) => (...): função arrow que recebe cada anime como parâmetro
          favorites.map((anime) => (
            
            // Div para cada anime favorito
            // key={anime.mal_id}: identificador único do elemento (React usa isso para eficiência)
            <div key={anime.mal_id} className="fav-item">
              
              {/* Imagem do anime */}
              <img 
                className="fav-thumb"
                // src: caminho da imagem do anime
                src={anime.image}
                // alt: texto alternativo se a imagem não carregar
                alt={anime.title}
                // onError: evento acionado se a imagem falhar ao carregar
                // (e) => e.target.style.display = 'none': esconde a imagem se houver erro
                onError={(e) => e.target.style.display = 'none'}
              />
              
              {/* Título do anime */}
              <div>{anime.title}</div>
              
              {/* Container dos botões de ação */}
              <div className="fav-actions">
                
                {/* Botão "Ver" - abre os detalhes do anime */}
                <button 
                  className="fav-btn fav-open"
                  // onClick: quando clica, chama onSelectAnime passando o ID do anime
                  // () => onSelectAnime(anime.mal_id): função arrow que evita executar imediatamente
                  onClick={() => onSelectAnime(anime.mal_id)}
                >
                  Ver
                </button>
                
                {/* Botão "Remover" - remove o anime dos favoritos */}
                <button 
                  className="fav-btn fav-remove"
                  // onClick: quando clica, chama onRemoveFavorite passando o ID do anime
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

// Exporta o componente para que possa ser usado em outros arquivos
export default Favorites;
