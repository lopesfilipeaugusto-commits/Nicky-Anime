# ⚡ Quick Start Guide

## Instalação Rápida (5 minutos)

### 1. Navega ao diretório
```powershell
cd "c:\Users\Filipe Lopes\Documents\NickyAnime"
```

### 2. Instala as dependências
```powershell
npm install
```

### 3. Inicia o dev server
```powershell
npm start
```

A app abre automaticamente em `http://localhost:3000` 🎉

---

## Ficheiros Necessários no `public/`

Certifica-te que existem em `public/`:
- ✅ `NickyLogo.jpeg`
- ✅ `FundoTopAnime.jpg`
- ✅ `MusicaFundo.mp3`

Se não existem, copia-os da pasta original.

---

## Estrutura Criada

```
✅ src/App.jsx                    # Componente principal
✅ src/index.js                   # Entry point
✅ src/components/                # 6 componentes reutilizáveis
✅ src/hooks/                     # 2 custom hooks
✅ src/styles/App.css             # Todos os estilos originais
✅ public/index.html              # Template HTML React
✅ package.json                   # Dependências
✅ TRANSFORMACAO.md               # Documentação técnica
```

---

## Desenvolvimento

### Scripts disponíveis:

```bash
npm start       # Dev server (hot reload) - http://localhost:3000
npm run build   # Build para produção (pasta build/)
npm test        # Roda testes (se configurados)
npm run eject   # Ejeta configuração (não recomendado)
```

---

## Como Funciona a Estrutura React

### **App.jsx** (Componente Pai)
- Gerencia estado global (anime atual, histórico, favoritos)
- Faz calls à API Jikan
- Passa dados via props aos filhos

### **Components** (Filhos)
- SearchBox - input + pesquisa
- AnimeDisplay - mostra anime + resultados
- QuickSuggestions - sugestões rotativas
- Favorites - lista de favoritos
- LoginModal - modal de login
- MusicPlayer - player de música

### **Hooks** (Lógica Reutilizável)
- useLocalStorage - sincroniza com localStorage
- useFavorites - gerencia favoritos

### **Estilos**
- App.css - mesmo CSS do HTML original (sem mudanças)

---

## Exemplo: Adicionar um Novo Componente

### 1. Criar componente
```jsx
// src/components/MyFeature.jsx
import React from 'react';

function MyFeature({ data, onUpdate }) {
  return (
    <div>
      <p>{data}</p>
      <button onClick={onUpdate}>Update</button>
    </div>
  );
}

export default MyFeature;
```

### 2. Usar em App.jsx
```jsx
import MyFeature from './components/MyFeature';

// Inside App component:
<MyFeature data={someData} onUpdate={handleUpdate} />
```

---

## Troubleshooting

### `npm install` fails
```powershell
# Limpar cache
npm cache clean --force

# Tentar novamente
npm install
```

### Port 3000 já em uso
```powershell
# Usar porta diferente
npm start -- --port 3001
```

### Ficheiros de media não carregam
- Coloca `NickyLogo.jpeg`, `FundoTopAnime.jpg` e `MusicaFundo.mp3` em `public/`
- Reload a página no browser

### Erro de API (CORS)
- Jikan API é pública, sem CORS issues
- Se houver, pode ser problema de rede

---

## Diferenças HTML vs React

### Antes (HTML)
```html
<!-- 1300 linhas num arquivo -->
<script>
  let currentAnime = null;
  function displayAnime(anime) {
    document.getElementById('animeInfo').innerHTML = ...
  }
</script>
```

### Depois (React)
```jsx
// App.jsx
const [currentAnime, setCurrentAnime] = useState(null);

// AnimeDisplay.jsx
<div className="anime-info">
  {renderContent()}
</div>
```

✨ Muito mais limpo, modular e fácil de manter!

---

## Production Build

```powershell
npm run build
```

Cria pasta `build/` com:
- Bundle minificado
- Otimizações de performance
- Pronto para deploy (Vercel, Netlify, etc.)

---

## Recursos Úteis

- 📚 [React Docs](https://react.dev)
- 🪝 [React Hooks](https://react.dev/reference/react)
- 🎨 [CSS original preservado](src/styles/App.css)
- 📖 [Documentação completa](TRANSFORMACAO.md)

---

## Suporte

Se encontrares problemas:
1. Verifica [TRANSFORMACAO.md](TRANSFORMACAO.md)
2. Vê [README.md](README.md)
3. Checa erros na consola do browser (F12)

---

**Pronto para começar? `npm install && npm start` 🚀**
