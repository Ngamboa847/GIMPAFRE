import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../shared/auth/AuthContext";
import { ApiError } from "../../shared/api/client";

const LOGO_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAcDW-9YUpOP7CsE34t_d15SCr75nubm7blIwKq-JFihSQP5HTROmSA4KZ36vx3FtVBDQDoepylIppbPlYwbYhS9kg-0C6RP7PEg06kW291HYJPYBHo2emHJmUv3nqh1fY_ffCOHa2LfGKhpKb5jf6mY4gVBIhFjfokfZkgr146k5vs18yi7tXhYVu8no7ECcrZVuS1ShhRtzx1j17nl7wTarMUKZpL2OYvbE9k7LsmwW36-ENU-nXVgj-URqNSTmmhF35N07yBMCA";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [nombreUsuario, setNombreUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await login({ nombreUsuario, contrasena });
      navigate("/", { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Usuario o contraseña incorrectos.");
      } else {
        setError("No se pudo conectar con el servidor. Intente de nuevo.");
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="flex min-h-screen">
      {/* Panel izquierdo: identidad de marca (55%) */}
      <section className="hidden lg:flex lg:w-[55%] bg-sidebar-bg flex-col items-center justify-center text-center p-gutter relative overflow-hidden">
        <div className="z-10 flex flex-col items-center space-y-stack-lg max-w-md">
          <div className="w-[150px] h-[150px] mb-stack-md">
            <img
              alt="Escudo Gimnasio Pedagógico Paulo Freire"
              className="w-full h-full object-contain"
              src={LOGO_URL}
            />
          </div>
          <div className="space-y-stack-sm">
            <h1 className="font-headline text-[32px] font-bold text-white leading-tight">
              Gimnasio Pedagógico Paulo Freire
            </h1>
            <p className="font-headline text-[18px] text-white/80 font-normal italic">
              "Por la Excelencia Académica — Seguimos Creciendo"
            </p>
          </div>
        </div>
        <div className="absolute bottom-8 text-white/40 text-[12px] font-medium">
          Formando desde 1982
        </div>
      </section>

      {/* Panel derecho: formulario (45%) */}
      <section className="w-full lg:w-[45%] bg-white flex flex-col items-center justify-center p-gutter">
        <div className="w-full max-w-sm">
          {/* Logo móvil */}
          <div className="lg:hidden flex flex-col items-center mb-stack-lg">
            <img
              alt="Escudo Gimnasio Pedagógico Paulo Freire"
              className="w-24 h-24 mb-stack-sm object-contain"
              src={LOGO_URL}
            />
            <h2 className="font-headline text-[18px] font-semibold text-sidebar-bg">
              GIMPAFRE
            </h2>
          </div>

          <header className="mb-stack-lg">
            <h2 className="font-headline text-[24px] font-bold text-text-main">
              Iniciar sesión
            </h2>
            <p className="font-body text-[14px] text-text-muted mt-1">
              Plataforma de Gestión Académica
            </p>
          </header>

          <form className="space-y-stack-md" onSubmit={handleSubmit}>
            {/* Usuario */}
            <div className="space-y-1">
              <label
                className="block font-body text-[12px] font-semibold text-text-main"
                htmlFor="nombreUsuario"
              >
                Usuario
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-sidebar-bg transition-colors">
                  person
                </span>
                <input
                  id="nombreUsuario"
                  name="nombreUsuario"
                  type="text"
                  required
                  value={nombreUsuario}
                  onChange={(e) => setNombreUsuario(e.target.value)}
                  placeholder="Ingrese su usuario"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-border-subtle rounded-lg font-body text-[14px] focus:ring-2 focus:ring-sidebar-active focus:border-sidebar-active outline-none transition-all"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-1">
              <label
                className="block font-body text-[12px] font-semibold text-text-main"
                htmlFor="contrasena"
              >
                Contraseña
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-sidebar-bg transition-colors">
                  lock
                </span>
                <input
                  id="contrasena"
                  name="contrasena"
                  type={mostrarContrasena ? "text" : "password"}
                  required
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-white border border-border-subtle rounded-lg font-body text-[14px] focus:ring-2 focus:ring-sidebar-active focus:border-sidebar-active outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setMostrarContrasena((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-text-main transition-colors"
                >
                  <span className="material-symbols-outlined">
                    {mostrarContrasena ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Enlace recuperar contraseña — RF-49 diferido: deshabilitado */}
            <div className="flex justify-end">
              <span
                className="font-body text-[12px] font-semibold text-outline-variant cursor-not-allowed"
                title="Función no disponible en esta versión"
              >
                ¿Olvidó su contraseña?
              </span>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="text-[13px] text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={enviando}
              className="w-full bg-sidebar-bg text-white font-headline text-[18px] font-semibold py-4 rounded-lg shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>{enviando ? "Ingresando..." : "Ingresar"}</span>
              {!enviando && (
                <span className="material-symbols-outlined text-[20px]">
                  login
                </span>
              )}
            </button>
          </form>

          <footer className="mt-stack-lg pt-stack-lg border-t border-border-subtle text-center">
            <p className="font-body text-[12px] text-text-muted flex items-center justify-center space-x-1">
              <span className="material-symbols-outlined text-[14px]">
                location_on
              </span>
              <span>Sincelejo, Sucre · Colombia</span>
            </p>
            <div className="mt-2 text-[10px] text-outline-variant uppercase tracking-widest">
              © 2026 Gimnasio Pedagógico Paulo Freire
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}