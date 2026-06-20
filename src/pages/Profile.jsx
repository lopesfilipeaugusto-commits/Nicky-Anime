// ============================================
// --- AUTHENTICATION: Profile Page (ATUALIZADO) ---
// ============================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../context/AuthContext';
import { useAnimeLists } from '../hooks/useAnimeLists';
import LoginModal from '../components/LoginModal';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  HeartIcon,
  ListBulletIcon,
  PlusIcon,
  UserIcon,
  ArrowLeftOnRectangleIcon as LogOutIcon,
} from '@heroicons/react/24/outline';
import BrandLogo from '../components/BrandLogo';
import '../styles/AccountPages.css';
import '../styles/FavoritesPage.css';

function Profile() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { createList } = useAnimeLists();
  const [listName, setListName] = useState('');
  const [listError, setListError] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleGoBack = () => {
    navigate('/');
  };

  const handleAddList = () => {
    const result = createList(listName);

    if (!result.ok) {
      if (result.reason === 'duplicate_name') {
        setListError('Ja tens uma lista com esse nome. Escolhe outro.');
        return;
      }

      setListError('Escreve um nome valido para a tua lista.');
      return;
    }

    setListName('');
    setListError('');
    navigate('/lists');
  };

  const handleAddListKeyPress = (event) => {
    if (event.key === 'Enter') handleAddList();
  };

  const confirmLogout = async () => {
    await logout();
    navigate('/welcome');
  };

  const getUserDisplayName = () => {
    if (currentUser?.displayName) return currentUser.displayName;
    if (currentUser?.email) return currentUser.email.split('@')[0];
    return 'Utilizador';
  };

  const getUserInitial = () => getUserDisplayName().charAt(0).toUpperCase();

  return (
    <div className="account-page">
      <header className="account-page-header">
        <button type="button" className="account-back-button" onClick={handleGoBack}>
          ← Voltar
        </button>
        <div className="account-page-title-row">
          <BrandLogo size="xs" iconOnly />
          <h1 className="account-page-title">Perfil</h1>
        </div>
        <div className="account-page-header-spacer" aria-hidden="true" />
      </header>

      <div className="account-page-content">
        {currentUser && (
          <section className="account-card account-card-highlight">
            <div className="account-profile-hero">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={getUserDisplayName()}
                  className="account-avatar"
                />
              ) : (
                <div className="account-avatar-fallback">{getUserInitial()}</div>
              )}
              <div>
                <h2 className="account-profile-name">{getUserDisplayName()}</h2>
                {currentUser.email && (
                  <p className="account-profile-email">{currentUser.email}</p>
                )}
              </div>
            </div>

            <div className="account-actions-grid">
              <button
                type="button"
                className="account-btn account-btn-success"
                onClick={() => navigate('/lists')}
              >
                <ListBulletIcon />
                Ver listas
              </button>
              <button
                type="button"
                className="account-btn account-btn-secondary"
                onClick={() => navigate('/favorites')}
              >
                <HeartIcon />
                Favoritos
              </button>
            </div>

            <button
              type="button"
              className="account-btn account-btn-danger account-btn-block"
              style={{ marginTop: '14px' }}
              onClick={() => setShowLogoutConfirm(true)}
            >
              <LogOutIcon />
              Sair da conta
            </button>
          </section>
        )}

        <section className="account-card">
          <div className="account-card-header">
            <div className="account-card-icon">
              <PlusIcon />
            </div>
            <div>
              <h2 className="account-card-heading">Criar uma lista</h2>
              <p className="account-card-subtitle">
                Da um nome a tua lista e adiciona animes a partir do feed ou da pesquisa.
                Funciona sem conta — ou faz login para sincronizar entre dispositivos.
              </p>
            </div>
          </div>

          <div className="account-form-row">
            <input
              className="account-input"
              type="text"
              placeholder="Nome da nova lista"
              value={listName}
              onChange={(event) => {
                setListName(event.target.value);
                if (listError) setListError('');
              }}
              onKeyDown={handleAddListKeyPress}
            />
            <button type="button" className="account-btn account-btn-primary" onClick={handleAddList}>
              <PlusIcon />
              Criar lista
            </button>
          </div>
          {listError && <p className="account-error">{listError}</p>}
        </section>

        {!currentUser && (
          <section className="account-card">
            <div className="account-card-header">
              <div className="account-card-icon">
                <UserIcon />
              </div>
              <div>
                <h2 className="account-card-heading">Guardar os teus dados</h2>
                <p className="account-card-subtitle">
                  Faz login com Google ou email para sincronizar listas e favoritos entre dispositivos.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="account-btn account-btn-primary account-btn-block"
              onClick={() => setShowLoginModal(true)}
            >
              Entrar agora
            </button>
          </section>
        )}
      </div>

      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Sair por agora?</DialogTitle>
            <DialogDescription>
              Podes voltar quando quiseres. Queres mesmo sair da tua conta?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-stretch">
            <Button onClick={confirmLogout} variant="destructive" className="flex-1">
              Sim, sair
            </Button>
            <Button onClick={() => setShowLogoutConfirm(false)} variant="outline" className="flex-1">
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <LoginModal isOpen={showLoginModal} onSkip={() => setShowLoginModal(false)} />
      <BottomNav />
    </div>
  );
}

export default Profile;
