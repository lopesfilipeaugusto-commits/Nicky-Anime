import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

function SearchBox({ onSearch, onGoBack, canGoBack }) {
  const [input, setInput] = useState('');

  const handleSearch = () => {
    const query = input.trim();
    if (!query) {
      alert('Por favor, escreve um nome de anime!');
      return;
    }
    onSearch(query);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="search-box">
      <button 
        className="back-btn" 
        disabled={!canGoBack}
        onClick={onGoBack}
      >
        Voltar
      </button>
      <input
        type="text"
        id="searchInput"
        className="search-input"
        placeholder="Ex: death note, naruto, demon slayer..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        autoComplete="off"
      />
      <button 
        className="search-btn"
        onClick={handleSearch}
      >
        <MagnifyingGlassIcon className="w-4 h-4 inline-block align-text-bottom mr-2" aria-hidden="true" />
        Pesquisar
      </button>
    </div>
  );
}

export default SearchBox;
