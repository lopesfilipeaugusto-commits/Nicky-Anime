// ============================================
// --- AUTHENTICATION: App Root (ATUALIZADO) ---
// ============================================
// Envolver toda a aplicação com AuthProvider para fornecer contexto de autenticação
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AnimePage from './pages/AnimePage';
import Profile from './pages/Profile';
import FavoritesPage from './pages/FavoritesPage';
import ListsPage from './pages/ListsPage';
import InstallPrompt from './components/InstallPrompt';
import { AuthProvider } from './context/AuthContext';
import './index.css';
import './styles/base.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <>
          <InstallPrompt />
          <Routes>
            <Route path="/" element={<AnimePage />} />
            <Route path="/anime" element={<AnimePage />} />
            <Route path="/welcome" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/lists" element={<ListsPage />} />
          </Routes>
        </>
      </Router>
    </AuthProvider>
  );
}

export default App;

