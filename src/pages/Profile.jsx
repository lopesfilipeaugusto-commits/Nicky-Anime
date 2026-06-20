// ============================================
// --- AUTHENTICATION: Profile Page (ATUALIZADO) ---
// ============================================
// Perfil do usuário usando Firebase Auth
// Mostra nome/email do currentUser e permite criar listas personalizadas
// Botão de logout com confirmação
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
import '../styles/Profile.css';

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

  const handleGoToFavorites = () => {
    navigate('/favorites');
  };

  const handleAddList = () => {
    const result = createList(listName);

    if (!result.ok) {
      if (result.reason === 'duplicate_name') {
        setListError('Ja tens uma lista com esse nome. Escolhe outro para nao ficar tudo igual.');
        return;
      }

      setListError('Escreve um nome valido para a tua lista.');
      return;
    }

    setListName('');
    setListError('');
    navigate('/lists');
  };

  const handleGoToLists = () => {
    navigate('/lists');
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    await logout();
    navigate('/welcome');
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Obter nome de exibição: prioriza displayName do Google, depois email antes do @
  const getUserDisplayName = () => {
    if (currentUser?.displayName) return currentUser.displayName;
    if (currentUser?.email) return currentUser.email.split('@')[0];
    return 'Utilizador';
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button className="back-button" onClick={handleGoBack}>
          Voltar
        </button>
        <h1 className="profile-title">Perfil</h1>
        <div className="profile-spacer"></div>
      </div>

      <div className="profile-content">
        {/* Lista de criação — disponível para todos, autenticados ou não */}
        <div className="profile-card">
          <h2 className="profile-name">Criar uma lista de animes</h2>
          <p className="profile-email" style={{ marginBottom: '16px' }}>
            Da um nome a tua lista e abre "Ver listas" para a gerires. Quando fores a um anime, podes adiciona-lo diretamente a lista que quiseres. Podes fazer isto sem conta — ou entao faz login para guardares os teus dados sincronizados.
          </p>
          <div className="profile-list-creator">
            <input
              className="profile-list-input"
              type="text"
              placeholder="Nome da nova lista"
              value={listName}
              onChange={(event) => {
                setListName(event.target.value);
                if (listError) setListError('');
              }}
            />
            <button className="profile-list-btn" onClick={handleAddList}>
              Adicionar uma lista
            </button>
            {listError && <p className="profile-list-error">{listError}</p>}
          </div>
        </div>

        {/* Informações de perfil — apenas para utilizadores autenticados */}
        {currentUser && (
          <div className="profile-card">
            <h2 className="profile-name">
              {getUserDisplayName()}
            </h2>
            {currentUser.email && (
              <p className="profile-email">{currentUser.email}</p>
            )}
            <button className="profile-lists-btn" onClick={handleGoToLists}>
              Ver listas
            </button>
            <button className="profile-favorites-btn" onClick={handleGoToFavorites}>
              Ir para Favoritos
            </button>
            <button className="profile-logout-btn" onClick={handleLogoutClick}>
              Sair da conta
            </button>
          </div>
        )}

        {!currentUser && (
          <div className="profile-card">
            <h2 className="profile-name">Queres guardar os teus dados?</h2>
            <p className="profile-email">
              Faz login com Google ou email para sincronizar tuas listas e favoritos entre dispositivos.
            </p>
            <button className="profile-list-btn" onClick={() => setShowLoginModal(true)}>
              Entrar agora
            </button>
          </div>
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
            <Button onClick={cancelLogout} variant="outline" className="flex-1">
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
