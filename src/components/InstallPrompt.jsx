import React, { useState, useEffect } from 'react';
import BrandLogo from './BrandLogo';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstall(false);
      setInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Se já foi instalado (visited dentro do PWA), não mostra o banner
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setInstalled(true);
    }
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  const handleDismiss = () => {
    setShowInstall(false);
  };

  if (!showInstall || installed) return null;

  return (
    <div className="install-banner">
      <BrandLogo size="xs" iconOnly className="install-banner-logo" />
      <span className="install-banner-text">Adiciona o Nicky Anime ao teu ecrã inicial!</span>
      <button className="install-banner-btn" onClick={handleInstall}>
        Instalar
      </button>
      <button className="install-banner-dismiss" onClick={handleDismiss} aria-label="Fechar">
        ×
      </button>
    </div>
  );
};

export default InstallPrompt;
