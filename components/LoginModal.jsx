import React, { useState } from 'react';
import { HandRaisedIcon } from '@heroicons/react/24/outline';

function LoginModal({ isOpen, onSave, onSkip }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onSave({ name: trimmedName, email: email.trim() });
    setName('');
    setEmail('');
  };

  const handleGoogle = () => {
    onSave({ name: 'Utilizador Google', email: 'google@demo.com' });
    setName('');
    setEmail('');
  };

  const handleSkip = () => {
    onSkip();
    setName('');
    setEmail('');
  };

  if (!isOpen) return null;

  return (
    <div className="login-modal show">
      <div className="login-card">
        <h3>
          Bem-vindo{' '}
          <HandRaisedIcon className="w-4 h-4 inline-block align-text-bottom" aria-hidden="true" />
        </h3>
        <p>Podes fazer um login simples, usar "Google" (simulado) ou saltar.</p>

        <input
          id="loginName"
          type="text"
          placeholder="O teu nome (ex: Filipe)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          id="loginEmail"
          type="email"
          placeholder="Email (opcional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="login-actions">
          <button 
            id="loginSave"
            className="login-btn login-primary"
            onClick={handleSave}
          >
            Guardar nome
          </button>
          <button 
            id="loginGoogle"
            className="login-btn login-secondary"
            onClick={handleGoogle}
          >
            Login com Google (simulado)
          </button>
          <button 
            id="loginSkip"
            className="login-btn login-skip"
            onClick={handleSkip}
          >
            Saltar
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
