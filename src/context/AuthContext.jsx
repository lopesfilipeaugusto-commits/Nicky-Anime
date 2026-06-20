import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../config/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    getRedirectResult(auth)
      .then((result) => {
        if (!isMounted || !result?.user) return;
        setAuthMessage('Entraste com Google com sucesso.');
      })
      .catch((error) => {
        if (!isMounted) return;
        setAuthMessage(getErrorMessage(error.code));
      });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!isMounted) return;
      setCurrentUser(user);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const getMissingConfigError = () => ({
    ok: false,
    error: 'O login ainda nao esta pronto. Falta ligar bem o Firebase neste projeto.'
  });

  const loginWithEmail = async (email, password) => {
    if (!isFirebaseConfigured) return getMissingConfigError();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { ok: true, user: userCredential.user };
    } catch (error) {
      return {
        ok: false,
        error: getErrorMessage(error.code)
      };
    }
  };

  const registerWithEmail = async (email, password) => {
    if (!isFirebaseConfigured) return getMissingConfigError();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { ok: true, user: userCredential.user };
    } catch (error) {
      return {
        ok: false,
        error: getErrorMessage(error.code)
      };
    }
  };

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured) return getMissingConfigError();

    try {
      const result = await signInWithPopup(auth, googleProvider);
      setAuthMessage('');
      return { ok: true, user: result.user };
    } catch (error) {
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
        try {
          await signInWithRedirect(auth, googleProvider);
          return {
            ok: true,
            pendingRedirect: true,
            message: 'O browser abriu o login por redirecionamento. Voltas aqui ja autenticado.'
          };
        } catch (redirectError) {
          return {
            ok: false,
            error: getErrorMessage(redirectError.code)
          };
        }
      }

      return {
        ok: false,
        error: getErrorMessage(error.code)
      };
    }
  };

  const logout = async () => {
    if (!isFirebaseConfigured) return getMissingConfigError();

    try {
      await signOut(auth);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: getErrorMessage(error.code)
      };
    }
  };

  const value = {
    currentUser,
    loading,
    authMessage,
    setAuthMessage,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a1a2e',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif'
        }}>
          A carregar...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function getErrorMessage(errorCode) {
  switch (errorCode) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Esse email ou password nao batem certo. Tenta outra vez.';
    case 'auth/email-already-in-use':
      return 'Esse email ja esta a ser usado noutra conta.';
    case 'auth/weak-password':
      return 'Essa password esta fraquinha. Usa pelo menos 6 caracteres.';
    case 'auth/invalid-email':
      return 'Esse email nao parece valido.';
    case 'auth/user-disabled':
      return 'Esta conta foi desativada.';
    case 'auth/too-many-requests':
      return 'Foram feitas muitas tentativas seguidas. Espera um pouco e tenta de novo.';
    case 'auth/popup-closed-by-user':
      return 'O login com Google foi fechado antes de terminar.';
    case 'auth/popup-blocked':
      return 'O browser bloqueou a janela do Google. Permite popups e tenta outra vez.';
    case 'auth/cancelled-popup-request':
      return 'Ja ha uma tentativa de login a acontecer. Espera um bocadinho.';
    case 'auth/unauthorized-domain':
      return 'Este dominio ainda nao esta autorizado no Firebase Authentication.';
    case 'auth/operation-not-allowed':
      return 'O login com Google ainda nao esta ativado no Firebase Console.';
    case 'auth/invalid-api-key':
      return 'A configuracao do Firebase tem uma API key invalida.';
    case 'auth/app-not-authorized':
      return 'Esta app ainda nao esta autorizada a usar o Firebase Authentication.';
    case 'auth/network-request-failed':
      return 'Parece haver um problema de ligacao. Confirma a internet e tenta outra vez.';
    default:
      return `Aconteceu um erro (${errorCode || 'desconhecido'}).`;
  }
}
