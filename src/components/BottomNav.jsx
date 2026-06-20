
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PlusIcon, XMarkIcon, HomeIcon, AcademicCapIcon as Search, HeartIcon, ListBulletIcon, UserIcon, ArrowLeftOnRectangleIcon as LogOutIcon } from '@heroicons/react/24/outline';

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();   
  const { currentUser, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAnimeHome = location.pathname === '/' || location.pathname === '/anime';

  const handleScrollTo = (elementId) => {
    if (!isAnimeHome) {
      navigate('/');
      window.setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
      return;
    }

    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate('/welcome');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavClick = (callback) => {
    callback();
    setIsMenuOpen(false);
  };

  const menuItems = [
    { icon: HomeIcon, label: 'Home', onClick: () => navigate('/') },
    { icon: Search, label: 'Pesquisa', onClick: () => handleScrollTo('searchInput') },
    { icon: HeartIcon, label: 'Favoritos', onClick: () => navigate('/favorites') },
    { icon: ListBulletIcon, label: 'Listas', onClick: () => navigate('/lists') },
    { icon: UserIcon, label: 'Perfil', onClick: () => navigate('/profile') },
  ];

  return (
    <>
      {/* Floating Menu Button */}
      <button 
        onClick={toggleMenu}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-300 ${
          isMenuOpen ? 'scale-110' : 'hover:scale-105'
        }`}
        aria-label="Menu"
        title="Abrir menu"
      >
        {isMenuOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <PlusIcon className="w-6 h-6" />
        )}
      </button>

      {/* Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Menu Panel */}
      <nav 
        className={`fixed bottom-24 right-6 z-40 bg-card border border-border rounded-lg shadow-lg overflow-hidden transition-all duration-300 origin-bottom-right ${
          isMenuOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="min-w-[200px] py-2">
          {/* Menu Items */}
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.onClick)}
              className="w-full px-4 py-3 text-left hover:bg-accent/10 transition-colors flex items-center gap-3 group"
            >
              <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
              <span className="group-hover:text-accent transition-colors">{item.label}</span>
            </button>
          ))}

          {/* Divider */}
          {currentUser && <div className="h-px bg-border my-2" />}

          {/* Auth Button */}
          {currentUser ? (
            <>
              <div className="px-4 py-2 text-sm text-muted-foreground border-b border-border">
                {currentUser.displayName || currentUser.email?.split('@')[0] || 'Utilizador'}
              </div>
              <button
                onClick={() => handleNavClick(handleLogout)}
                className="w-full px-4 py-3 text-left hover:bg-destructive/10 transition-colors flex items-center gap-3 group"
              >
                <LogOutIcon className="w-5 h-5 text-muted-foreground group-hover:text-destructive transition-colors" />
                <span className="group-hover:text-destructive transition-colors">Sair</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => handleNavClick(() => navigate('/welcome'))}
              className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors flex items-center gap-3 group"
            >
                <UserIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="group-hover:text-primary transition-colors">Entrar</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}

export default BottomNav;
