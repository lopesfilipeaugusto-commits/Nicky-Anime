import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import LoginModal from '../components/LoginModal';
import { useAuth } from '../context/AuthContext';
import { ArrowLeftOnRectangleIcon as LogOutIcon, HeartIcon, ListBulletIcon, MagnifyingGlassIcon, PlayIcon as Play, UserIcon } from '@heroicons/react/24/outline';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

function Home() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleSkip = () => {
    setShowLoginModal(false);
    navigate('/');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    await logout();
    setShowLogoutConfirm(false);
    navigate('/welcome');
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Play className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  NickyAnime
                </h1>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate('/')}
                variant="default"
                size="default"
              >
                <Play className="w-4 h-4 inline mr-2" />
                Começar
              </Button>
              <Button
                onClick={handleProfileClick}
                variant="outline"
                size="default"
              >
                <UserIcon className="w-4 h-4" />
                Perfil
              </Button>
              {currentUser && (
                <button
                  onClick={handleLogoutClick}
                  className="p-2 rounded-lg border border-border hover:bg-destructive/10 transition-colors"
                  title="Terminar sessão"
                >
                  <LogOutIcon className="w-4 h-4 text-destructive" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full space-y-8 text-center animate-fadeIn">
          {/* Hero Section */}
          <div className="space-y-4">
            <div className="inline-block px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
              <p className="text-sm font-medium text-accent">Bem-vindo ao Nicky Anime</p>
            </div>
            
            <h2 className="text-5xl sm:text-6xl font-bold tracking-tight">
              Descobre o teu
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Anime Perfeito
              </span>
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Explora uma vasta coleção de animes, guarda os teus favoritos, cria listas personalizadas e descobre novas séries ao teu ritmo.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button
              onClick={currentUser ? () => navigate('/') : handleLoginClick}
              size="lg"
              variant="ghost"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:scale-105 transition-all"
            >
              <Play className="w-5 h-5 inline mr-2" />
              {currentUser ? 'Começar a Explorar' : 'Entrar'}
            </Button>
            <Button
              onClick={() => navigate('/')}
              size="lg"
              variant="outline"
              className="border-2 border-primary text-primary hover:bg-primary/10 transition-colors"
            >
              Ver Animes
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12">
            {[
              { icon: MagnifyingGlassIcon, title: 'Pesquisa Avançada', desc: 'Encontra animes por género, ano ou rating' },
              { icon: HeartIcon, title: 'Favoritos', desc: 'Guarda os teus animes favoritos' },
              { icon: ListBulletIcon, title: 'Listas Pessoais', desc: 'Cria e organiza as tuas listas' },
            ].map((feature, i) => (
              <Card
                key={i}
                className="p-4 bg-card/50 hover:bg-card transition-colors shadow-none"
              >
                <feature.icon className="w-8 h-8 mb-2 text-accent" />
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-4 text-center text-sm text-muted-foreground">
        <p>© 2026 NickyAnime. Todos os direitos reservados.</p>
      </footer>

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onSkip={handleSkip}
      />

      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Sair por agora?</DialogTitle>
            <DialogDescription>
              Podes voltar quando quiseres. Tens a certeza que queres terminar a sessão?
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

      <BottomNav />
    </div>
  );
}

export default Home;
