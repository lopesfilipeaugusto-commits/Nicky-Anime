
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  PlusIcon,
  XMarkIcon,
  HomeIcon,
  AcademicCapIcon as Search,
  HeartIcon,
  ListBulletIcon,
  UserIcon,
  ArrowLeftOnRectangleIcon as LogOutIcon,
} from '@heroicons/react/24/outline';

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
    setIsMenuOpen((open) => !open);
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

  const authItem = currentUser
    ? {
        icon: LogOutIcon,
        label: 'Sair',
        className: 'bottom-nav-fab-btn-danger',
        onClick: handleLogout,
      }
    : {
        icon: UserIcon,
        label: 'Entrar',
        onClick: () => navigate('/welcome'),
      };

  const slideItems = [...menuItems, authItem];

  return (
    <>
      {isMenuOpen && (
        <div
          className="bottom-nav-fab-overlay"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="bottom-nav-fab">
        <button
          type="button"
          onClick={toggleMenu}
          className={`bottom-nav-fab-plus ${isMenuOpen ? 'open' : ''}`}
          aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isMenuOpen}
          title={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {isMenuOpen ? <XMarkIcon /> : <PlusIcon />}
        </button>

        <nav
          className={`bottom-nav-fab-track ${isMenuOpen ? 'open' : ''}`}
          aria-label="Navegação rápida"
          aria-hidden={!isMenuOpen}
        >
          {slideItems.map((item, index) => {
            const delayIndex = slideItems.length - 1 - index;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleNavClick(item.onClick)}
                className={`bottom-nav-fab-btn ${item.className || ''}`}
                style={{ transitionDelay: isMenuOpen ? `${delayIndex * 0.05}s` : '0s' }}
                title={item.label}
                aria-label={item.label}
                tabIndex={isMenuOpen ? 0 : -1}
              >
                <item.icon />
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}

export default BottomNav;
