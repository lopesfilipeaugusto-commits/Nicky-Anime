# Nickel Anime - React Version

Transformação do projeto HTML/Vanilla JS para React.

## 📁 Estrutura do Projeto

```
src/
├── App.jsx                  # Componente principal com lógica de estado
├── index.js                 # Entrada da aplicação
├── components/
│   ├── SearchBox.jsx       # Busca e botão voltar
│   ├── AnimeDisplay.jsx    # Exibição do anime e resultados
│   ├── QuickSuggestions.jsx # Sugestões rápidas (top + random)
│   ├── Favorites.jsx       # Lista de favoritos
│   ├── LoginModal.jsx      # Modal de login simples
│   └── MusicPlayer.jsx     # Player de música flutuante
├── hooks/
│   ├── useLocalStorage.js  # Hook para persistência em localStorage
│   └── useFavorites.js     # Hook para gerenciar favoritos
└── styles/
    └── App.css             # Todos os estilos (do HTML original)
public/
└── index.html              # Arquivo HTML principal
```

## 🚀 Como Começar

### Requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn

### Instalação

1. Navega para o diretório do projeto:
```bash
cd c:\Users\Filipe Lopes\Documents\NickyAnime
```

2. Instala as dependências:
```bash
npm install
```

3. Coloca os ficheiros de mídia no diretório `public/`:
   - `NickyLogo.jpeg`
   - `FundoTopAnime.jpg`
   - `MusicaFundo.mp3`

4. Inicia o servidor de desenvolvimento:
```bash
npm start
```

A aplicação abrirá em `http://localhost:3000`

## 🔄 Como foi feita a transformação?

### 1. **Separação em Componentes**
Dividiu-se o código monolítico HTML/JS em componentes React:
- **App.jsx**: Estado global, lógica principal, API calls
- **SearchBox**: Controlo de pesquisa
- **AnimeDisplay**: Mostra anime e resultados
- **QuickSuggestions**: Sugestões rotativas
- **Favorites**: Lista de favoritos colapsável
- **LoginModal**: Modal de login
- **MusicPlayer**: Controlo de música

### 2. **Gestão de Estado com Hooks**
- `useState`: Para estado local (anime atual, loading, erro, histórico)
- `useEffect`: Para carregar sugestões e rotação automática
- `useRef`: Para elemento de áudio (MusicPlayer)
- Hooks customizados:
  - `useLocalStorage`: Leitura/escrita em localStorage
  - `useFavorites`: Lógica de favoritos (add, remove, check)

### 3. **Props e Callbacks**
- Comunicação entre componentes via props
- Callbacks para eventos (onSearch, onGoBack, onToggleFavorite, etc.)
- Elevação de estado quando necessário

### 4. **API & localStorage**
- Mantém mesma API Jikan (sem mudanças)
- localStorage para:
  - Favoritos (`animeFavorites`)
  - User data (`nickelUser`)
  - Estado colapsado dos favoritos (`favoritesCollapsed`)

### 5. **Estilos**
- CSS idêntico ao original, importado em App.css
- Sem dependências de CSS-in-JS (usa CSS puro)

## 📝 Comparação: HTML vs React

| Aspecto | HTML/JS Original | React |
|---------|------------------|-------|
| Estrutura | DOM direto | Componentes |
| Estado | Variáveis globais | useState/hooks |
| Re-render | Manual (innerHTML) | Automático |
| Organização | Arquivo único ~1300 linhas | Múltiplos componentes reutilizáveis |
| Manutenibilidade | Difícil à medida que cresce | Modular e escalável |
| Performance | OK para pequeno | Melhoria com React (virtual DOM) |

## 🎯 Funcionalidades Preservadas

✅ Pesquisa de animes (Jikan API)
✅ Sugestões rápidas com rotação automática
✅ Histórico (botão Voltar)
✅ Favoritos com persistência
✅ Login simulado com localStorage
✅ Player de música
✅ Design responsivo
✅ Tratamento de erros

## 🛠️ Próximos Passos (Opcional)

- Adicionar TypeScript para melhor tipagem
- Context API ou Redux para estado global
- Tests com Jest/React Testing Library
- Otimização com React.memo() para componentes
- PWA (offline support)
- Temas escuro/claro

## 📚 Documentação

- [React Docs](https://react.dev)
- [Jikan API](https://jikan.moe/docs/api)
- [MDN - localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

**Desenvolvido com ❤️ em React**
