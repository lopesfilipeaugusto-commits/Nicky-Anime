import React, { useState } from 'react';
import { HomeIcon, MagnifyingGlassIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from './ui/button';
import { Input } from './ui/input';

function SearchBox({ onSearch, onGoBack, canGoBack, hasSearched, onReturnHome }) {
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
    <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
      <div className="max-w-7xl mx-auto space-y-3">
        <div className="flex gap-2">
          {hasSearched ? (
            <Button
              variant="outline"
              className="px-4 py-2 font-medium flex items-center gap-2"
              onClick={onReturnHome}
              title="Voltar ao menu de pesquisa"
            >
              <HomeIcon className="w-5 h-5" />
              Menu Principal
            </Button>
          ) : (
            <Button
              variant="outline"
              className="px-4 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!canGoBack}
              onClick={onGoBack}
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Voltar
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              type="text"
              id="searchInput"
              placeholder="Ex: death note, naruto, demon slayer..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              autoComplete="off"
            />
          </div>
          <Button
            className="px-6 py-2.5 font-medium flex items-center gap-2 whitespace-nowrap"
            onClick={handleSearch}
            variant="default"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
            Pesquisar
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SearchBox;
