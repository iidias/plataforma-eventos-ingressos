// AuthContext (tarefa 64): guarda token e usuário, persiste no localStorage e
// expõe login()/logout() para qualquer componente da árvore.
// A tela de login em si é a tarefa 69 — aqui só existe a infraestrutura.

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { TOKEN_STORAGE_KEY } from '../api/client.js';

const USER_STORAGE_KEY = 'auth.user';

const AuthContext = createContext(null);

// Lê a autenticação persistida uma única vez, na montagem do provider.
// Se algo estiver corrompido, limpa e começa deslogado.
function readPersistedAuth() {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const rawUser = localStorage.getItem(USER_STORAGE_KEY);
    if (!token || !rawUser) return { token: null, user: null };
    return { token, user: JSON.parse(rawUser) };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readPersistedAuth);

  const login = useCallback((token, user) => {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch {
      // Sem localStorage (modo privado, por exemplo) a sessão vale só para esta aba.
    }
    setAuth({ token, user });
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // ignora
    }
    setAuth({ token: null, user: null });
  }, []);

  const value = useMemo(
    () => ({
      token: auth.token,
      user: auth.user,
      isAuthenticated: Boolean(auth.token && auth.user),
      login,
      logout,
    }),
    [auth, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  }
  return context;
}

export default AuthContext;
