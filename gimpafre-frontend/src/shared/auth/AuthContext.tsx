// Estado global de sesión.
// - Al montar: si hay token en localStorage, recupera el usuario vía GET /api/auth/me.
// - login(): guarda token, carga el usuario, deja lista la sesión.
// - logout(): limpia token y usuario.

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiRequest, setToken, clearToken, getToken } from "../api/client";
import type {
  LoginRequest,
  LoginResponse,
  UsuarioAutenticado,
} from "../../features/auth/types";

interface AuthContextValue {
  usuario: UsuarioAutenticado | null;
  cargando: boolean; // true mientras se resuelve la sesión inicial
  login: (credenciales: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [cargando, setCargando] = useState(true);

  // Recupera la sesión al cargar la app (si hay token guardado).
  useEffect(() => {
    async function recuperarSesion() {
      if (!getToken()) {
        setCargando(false);
        return;
      }
      try {
        const me = await apiRequest<UsuarioAutenticado>("/api/auth/me");
        setUsuario(me);
      } catch {
        // Token inválido/expirado: el client ya limpió y redirigió si aplica.
        clearToken();
        setUsuario(null);
      } finally {
        setCargando(false);
      }
    }
    recuperarSesion();
  }, []);

  async function login(credenciales: LoginRequest) {
    // 1. Autenticar y obtener token.
    const { token } = await apiRequest<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: credenciales,
      skipAuth: true,
    });
    setToken(token);

    // 2. Cargar el usuario autenticado (rol incluido) vía /me.
    const me = await apiRequest<UsuarioAutenticado>("/api/auth/me");
    setUsuario(me);
  }

  function logout() {
    clearToken();
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook de acceso a la sesión.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return ctx;
}