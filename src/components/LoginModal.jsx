import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

function LoginModal({ isOpen, onSkip }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { loginWithEmail, registerWithEmail, loginWithGoogle, authMessage, setAuthMessage } = useAuth();

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setError('');
    setAuthMessage('');
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (isRegister && !trimmedName) {
      setError('Falta so o teu nome.');
      return;
    }
    if (!trimmedEmail) {
      setError('Escreve o teu email para continuar.');
      return;
    }
    if (!password) {
      setError('Falta a password.');
      return;
    }
    if (password.length < 6) {
      setError('A password precisa de ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setError('');
    setAuthMessage('');

    try {
      const result = isRegister
        ? await registerWithEmail(trimmedEmail, password)
        : await loginWithEmail(trimmedEmail, password);

      if (result.ok) {
        onSkip();
        resetForm();
      } else {
        setError(result.error || 'Erro ao entrar.');
      }
    } catch {
      setError('Erro de ligacao. Verifica a internet e tenta de novo.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    setAuthMessage('');

    try {
      const result = await loginWithGoogle();

      if (result?.pendingRedirect) {
        return;
      }

      if (result.ok) {
        onSkip();
        resetForm();
      } else {
        setError(result.error || 'Erro ao entrar com Google.');
      }
    } catch {
      setError('Erro de ligacao. Verifica a internet e tenta de novo.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open) => {
    if (!open) {
      onSkip();
      resetForm();
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setAuthMessage('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex justify-center pb-2">
            <BrandLogo size="md" />
          </div>
          <DialogTitle>Vamos la entrar</DialogTitle>
          <DialogDescription>
            {isRegister
              ? 'Cria a tua conta em menos de um minuto e guarda tudo o que gostas.'
              : 'Entra para ficares com o teu perfil, favoritos e listas sempre contigo.'}
          </DialogDescription>
        </DialogHeader>

        {authMessage && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {authMessage}
          </p>
        )}

        <form onSubmit={handleEmailSubmit} className="space-y-3">
          {isRegister && (
            <Input
              id="loginName"
              type="text"
              placeholder="Como te queres chamar aqui?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          )}
          <Input
            id="loginEmail"
            type="email"
            placeholder="O teu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
          <Input
            id="loginPassword"
            type="password"
            placeholder="Escolhe uma password (minimo 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />

          {error && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter className="pt-2 sm:justify-stretch">
            <Button id="loginEmailBtn" type="submit" disabled={loading} className="w-full">
              {loading ? 'A entrar...' : (isRegister ? 'Criar conta' : 'Entrar')}
            </Button>
            <Button
              id="loginGoogle"
              type="button"
              variant="outline"
              onClick={handleGoogle}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'A ligar ao Google...' : 'Entrar com Google'}
            </Button>
            <Button
              id="loginSkip"
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
              className="w-full"
            >
              Agora nao
            </Button>
          </DialogFooter>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={toggleMode}
            disabled={loading}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline disabled:opacity-50"
          >
            {isRegister ? 'Ja tens conta? Entra aqui' : 'Ainda nao tens conta? Cria uma'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default LoginModal;
