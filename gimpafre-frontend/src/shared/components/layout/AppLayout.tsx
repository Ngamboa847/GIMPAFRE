import { Outlet, useLocation } from "react-router";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useAuth } from "../../auth/AuthContext";
import { tieneAccesoARuta } from "../../auth/permisos";

export function AppLayout() {
  const { usuario } = useAuth();
  const location = useLocation();
  const autorizado = tieneAccesoARuta(location.pathname, usuario?.rol);

  return (
    <>
      <Sidebar />
      <div className="ml-[250px] min-h-screen flex flex-col bg-surface-container-low">
        <Topbar />
        <main className="p-gutter flex-1">
          {autorizado ? (
            <Outlet />
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-24">
              <span className="material-symbols-outlined text-[48px] text-text-muted mb-4">lock</span>
              <h1 className="font-headline text-[22px] font-bold text-text-main mb-2">
                No tienes acceso a esta sección
              </h1>
              <p className="font-body text-[14px] text-text-muted max-w-sm">
                Tu rol ({usuario?.rolDenominacion ?? "actual"}) no tiene permiso para ver este contenido.
                Si crees que esto es un error, contacta al administrador del sistema.
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}