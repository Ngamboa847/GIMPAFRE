// Guardián de rutas privadas.
// - Mientras se resuelve la sesión inicial: no decide nada (evita parpadeo a login).
// - Sin usuario: redirige a /login.
// - Con usuario: renderiza la vista solicitada.

import { Navigate, Outlet } from "react-router";
import { useAuth } from "./AuthContext";

export function ProtectedRoute() {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return null; // o un spinner; lo afinamos al montar el shell
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}