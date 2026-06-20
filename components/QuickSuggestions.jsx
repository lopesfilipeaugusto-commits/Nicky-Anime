import React, { useState, useEffect } from 'react';

function QuickSuggestions({ onSelectAnime }) {
  const [quickList, setQuickList] = useState([]);
  const [loading, setLoading] = useState(true);

  const shuffleList = (list) => {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const loadQuickSuggestions = async (total = 6, topCount = 1) => {
    setLoading(true);
    const randomCount = Math.max(total - topCount, 0);

    try {
      const randomRequests = Array.from({ length: Math.max(randomCount * 2, 4) }, () =>
        fetch("https://api.jikan.moe/v4/random/anime")
          .then(res => res.ok ? res.json() : null)
          .then(data => (data && data.data ? data.data : null))
          .catch(() => null)
      );

      const topResponse = await fetch("https://api.jikan.moe/v4/top/anime?limit=25");
      const topData = topResponse.ok ? await topResponse.json() : { data: [] };
      const topItems = topData.data || [];

      const randomItems = await Promise.all(randomRequests);

      const topList = shuffleList(topItems).slice(0, topCount);

      const uniq = new Map();
      randomItems.filter(Boolean).forEach((a) => {
        if (!uniq.has(a.mal_id)) uniq.set(a.mal_id, a);
      });

      const randomList = shuffleList(Array.from(uniq.values())).slice(0, randomCount);

      const mixed = [];
      let i = 0;
      while (mixed.length < total && (topList[i] || randomList[i])) {
        if (topList[i]) mixed.push(topList[i]);
        if (randomList[i] && mixed.length < total) mixed.push(randomList[i]);
        i++;
      }

      setQuickList(mixed);
    } catch (err) {
      console.error('Error loading suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuickSuggestions(6, 1);

    const interval = setInterval(() => {
      setQuickList(prev => {
        if (prev.length <= 1) return prev;
        const newList = [...prev];
        const first = newList.shift();
        newList.push(first);
        return newList;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    setQuickList(prev => {
      if (prev.length <= 1) return prev;
      const newList = [...prev];
      const first = newList.shift();
      newList.push(first);
      return newList;
    });
  };

  if (loading) {
    return (
      <div className="quick-suggestions" id="quickSuggestions">
        <small style={{ color: '#999' }}>A carregar sugestões...</small>
      </div>
    );
  }

  return (
    <div className="quick-suggestions" id="quickSuggestions">
      {quickList.length === 0 ? (
        <small style={{ color: '#999' }}>Sem sugestões neste momento</small>
      ) : (
        <>
          {quickList.map((anime) => (
            <div
              key={anime.mal_id}
              className="quick-item"
              onClick={() => onSelectAnime(anime.mal_id)}
            >
              <img
                className="quick-thumb"
                src={anime.images?.jpg?.small_image_url || ''}
                alt={anime.title}
                onError={(e) => e.target.style.display = 'none'}
              />
              <span>{anime.title}</span>
            </div>
          ))}
          <button 
            className="quick-next"
            onClick={handleNext}
            title="Próximo"
          >
            →
          </button>
        </>
      )}
    </div>
  );
}

export default QuickSuggestions;
