import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  obtenerCuentaUsuario,
  crearCuentaUsuario,
  cambiarEstadoCuentaUsuario,
  eliminarCuentaUsuario,
} from "./api";
import type { CuentaUsuario, CuentaUsuarioEstado, CuentaUsuarioNueva } from "./types";
import { listarRoles } from "../configuracion/roles/api";
import type { Rol } from "../configuracion/roles/types";
import { listarDocentes } from "../docentes/api";
import type { Docente } from "../docentes/types";
import { buscarEstudiantePorDocumento, obtenerEstudiante } from "../estudiantes/api";
import type { Estudiante } from "../estudiantes/types";
import { ApiError } from "../../shared/api/client";

const CUENTA_VACIA: CuentaUsuarioNueva = {
  nombreUsuario: "",
  credenciales: "",
  idRol: 0,
  idDocente: undefined,
  idEstudiante: undefined,
};

function nombreCompletoDocente(d: Docente) {
  return [d.primerNombre, d.segundoNombre, d.primerApellido, d.segundoApellido].filter(Boolean).join(" ");
}

function nombreCompletoEstudiante(e: Estudiante) {
  return [e.primerNombre, e.segundoNombre, e.primerApellido, e.segundoApellido].filter(Boolean).join(" ");
}

export function CuentaUsuarioDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const modoCreacion = !id;

  // ---- Modo vista (cuenta existente) ----
  const [cuenta, setCuenta] = useState<CuentaUsuario | null>(null);
  const [cargando, setCargando] = useState(!modoCreacion);
  const [error, setError] = useState<string | null>(null);
  const [docenteVinculado, setDocenteVinculado] = useState<Docente | null>(null);
  const [estudianteVinculado, setEstudianteVinculado] = useState<Estudiante | null>(null);

  const [confirmandoEstado, setConfirmandoEstado] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  // ---- Modo creación ----
  const [borrador, setBorrador] = useState<CuentaUsuarioNueva>(CUENTA_VACIA);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [documentoEstudiante, setDocumentoEstudiante] = useState("");
  const [estudianteBuscado, setEstudianteBuscado] = useState<Estudiante | null>(null);
  const [buscandoEstudiante, setBuscandoEstudiante] = useState(false);
  const [errorBusquedaEstudiante, setErrorBusquedaEstudiante] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);

  // Catálogos del formulario de creación (roles y docentes; el estudiante se busca por documento)
  useEffect(() => {
    if (!modoCreacion) return;
    listarRoles().then(setRoles).catch(() => setRoles([]));
    listarDocentes().then(setDocentes).catch(() => setDocentes([]));
  }, [modoCreacion]);

  // Carga de la cuenta existente + resolución de nombre de docente/estudiante vinculado
  useEffect(() => {
    if (modoCreacion) return;
    let activo = true;
    obtenerCuentaUsuario(Number(id))
      .then((data) => {
        if (!activo) return;
        setCuenta(data);
        setCargando(false);
        if (data.idDocente != null) {
          listarDocentes()
            .then((lista) => {
              if (activo) setDocenteVinculado(lista.find((d) => d.idDocente === data.idDocente) ?? null);
            })
            .catch(() => {});
        }
        if (data.idEstudiante != null) {
          obtenerEstudiante(data.idEstudiante)
            .then((e) => {
              if (activo) setEstudianteVinculado(e);
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        if (activo) {
          setError("No se pudo cargar la cuenta.");
          setCargando(false);
        }
      });
    return () => {
      activo = false;
    };
  }, [id, modoCreacion]);

  function actualizarCampo<K extends keyof CuentaUsuarioNueva>(campo: K, valor: CuentaUsuarioNueva[K]) {
    setBorrador((prev) => ({ ...prev, [campo]: valor }));
  }

  async function buscarEstudiante() {
    if (!documentoEstudiante.trim()) return;
    setBuscandoEstudiante(true);
    setErrorBusquedaEstudiante(null);
    try {
      const encontrado = await buscarEstudiantePorDocumento(documentoEstudiante.trim());
      if (encontrado) {
        setEstudianteBuscado(encontrado);
        actualizarCampo("idEstudiante", encontrado.idEstudiante);
      } else {
        setEstudianteBuscado(null);
        actualizarCampo("idEstudiante", undefined);
        setErrorBusquedaEstudiante("No se encontró un estudiante con ese número de documento.");
      }
    } catch {
      setErrorBusquedaEstudiante("No se pudo buscar el estudiante.");
    } finally {
      setBuscandoEstudiante(false);
    }
  }

  function quitarEstudianteVinculado() {
    setEstudianteBuscado(null);
    setDocumentoEstudiante("");
    setErrorBusquedaEstudiante(null);
    actualizarCampo("idEstudiante", undefined);
  }

  const valido = borrador.nombreUsuario.trim() && borrador.credenciales.trim() && borrador.idRol > 0;

  async function guardar() {
    if (!valido) return;
    setGuardando(true);
    setErrorGuardado(null);
    try {
      const creada = await crearCuentaUsuario(borrador);
      navigate(`/cuentas-usuario/${creada.idCuentaUsuario}`);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setErrorGuardado("Ya existe una cuenta con ese nombre de usuario.");
        } else {
          setErrorGuardado((err.body as { mensaje?: string })?.mensaje ?? "No se pudo crear la cuenta.");
        }
      } else {
        setErrorGuardado("No se pudo conectar con el servidor.");
      }
    } finally {
      setGuardando(false);
    }
  }

  async function confirmarCambioEstado() {
    if (!cuenta) return;
    const nuevoEstado: CuentaUsuarioEstado = cuenta.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    setCambiandoEstado(true);
    setErrorAccion(null);
    try {
      const actualizada = await cambiarEstadoCuentaUsuario(cuenta.idCuentaUsuario, nuevoEstado);
      setCuenta(actualizada);
      setConfirmandoEstado(false);
    } catch {
      setErrorAccion("No se pudo cambiar el estado de la cuenta.");
    } finally {
      setCambiandoEstado(false);
    }
  }

  async function eliminar() {
    if (!cuenta) return;
    setEliminando(true);
    try {
      await eliminarCuentaUsuario(cuenta.idCuentaUsuario);
      navigate("/cuentas-usuario");
    } catch {
      setErrorAccion("No se pudo eliminar la cuenta. Intenta de nuevo.");
      setConfirmandoEliminar(false);
    } finally {
      setEliminando(false);
    }
  }
  const rolSeleccionado = roles.find((r) => r.idRol === borrador.idRol);
  const esRolEstudiante = rolSeleccionado?.codigo === "ESTUDIANTE";
  const rolElegido = borrador.idRol > 0;
  if (cargando) {
    return <p className="text-text-muted text-[14px]">Cargando cuenta...</p>;
  }
  if (error && !modoCreacion && !cuenta) {
    return (
      <div>
        <p className="text-error text-[14px] mb-4">{error}</p>
        <button onClick={() => navigate("/cuentas-usuario")} className="text-sidebar-bg text-[14px] underline">
          Volver al listado
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => navigate("/cuentas-usuario")}
        className="flex items-center gap-1 text-text-muted text-[13px] hover:text-text-main mb-4"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Volver a Cuentas de usuario
      </button>

      <div className="flex items-center justify-between mb-stack-lg">
        <h1 className="font-headline text-[28px] font-bold text-text-main">
          {modoCreacion ? "Nueva cuenta de usuario" : cuenta?.nombreUsuario}
        </h1>
        {!modoCreacion && cuenta && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfirmandoEstado(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold border border-border-subtle text-text-main hover:bg-surface-container-low transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">
                {cuenta.estado === "ACTIVO" ? "toggle_off" : "toggle_on"}
              </span>
              {cuenta.estado === "ACTIVO" ? "Inactivar cuenta" : "Activar cuenta"}
            </button>
            <button
              onClick={() => setConfirmandoEliminar(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold border border-error text-error hover:bg-error/5 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              Eliminar
            </button>
          </div>
        )}
      </div>

      {errorAccion && (
        <div className="mb-stack-md text-[13px] text-error bg-error/10 border border-error/20 rounded-lg px-4 py-3">
          {errorAccion}
        </div>
      )}

      {modoCreacion ? (
        <div className="bg-white rounded-lg border border-border-subtle p-stack-lg mb-stack-md">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-border-subtle">
            <span className="material-symbols-outlined text-sidebar-bg">manage_accounts</span>
            <h3 className="font-headline text-[18px] font-semibold text-on-primary-fixed">Datos de la cuenta</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-text-main mb-1">Nombre de usuario *</label>
              <input
                type="text"
                value={borrador.nombreUsuario}
                onChange={(e) => actualizarCampo("nombreUsuario", e.target.value)}
                className="w-full px-3 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] focus:ring-2 focus:ring-sidebar-active outline-none"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-text-main mb-1">Contraseña *</label>
              <input
                type="password"
                value={borrador.credenciales}
                onChange={(e) => actualizarCampo("credenciales", e.target.value)}
                className="w-full px-3 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] focus:ring-2 focus:ring-sidebar-active outline-none"
              />
            </div>
                        <div>
              <label className="block text-[12px] font-semibold text-text-main mb-1">Rol *</label>
              <select
                value={borrador.idRol || ""}
                onChange={(e) => {
                  const nuevoIdRol = e.target.value ? Number(e.target.value) : 0;
                  const nuevoRol = roles.find((r) => r.idRol === nuevoIdRol);
                  const nuevoEsEstudiante = nuevoRol?.codigo === "ESTUDIANTE";
                  setBorrador((prev) => ({
                    ...prev,
                    idRol: nuevoIdRol,
                    idDocente: nuevoEsEstudiante ? undefined : prev.idDocente,
                    idEstudiante: nuevoEsEstudiante ? prev.idEstudiante : undefined,
                  }));
                  if (!nuevoEsEstudiante) {
                    setEstudianteBuscado(null);
                    setDocumentoEstudiante("");
                    setErrorBusquedaEstudiante(null);
                  }
                }}
                className="w-full px-3 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] bg-white focus:ring-2 focus:ring-sidebar-active outline-none"
              >
                <option value="">Seleccione un rol</option>
                {roles.map((r) => (
                  <option key={r.idRol} value={r.idRol}>{r.denominacion}</option>
                ))}
              </select>
            </div>
                        <div>
              <label className="block text-[12px] font-semibold text-text-main mb-1">Docente vinculado (opcional)</label>
              <select
                value={borrador.idDocente ?? ""}
                onChange={(e) => actualizarCampo("idDocente", e.target.value ? Number(e.target.value) : undefined)}
                disabled={!rolElegido || esRolEstudiante}
                title={
                  !rolElegido
                    ? "Selecciona un rol primero."
                    : esRolEstudiante
                    ? "No aplica: el rol seleccionado es de estudiante/acudiente."
                    : undefined
                }
                className="w-full px-3 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] bg-white focus:ring-2 focus:ring-sidebar-active outline-none disabled:bg-surface-container-low disabled:text-text-muted disabled:cursor-not-allowed"
              >
                <option value="">— Sin vincular —</option>
                {docentes.map((d) => (
                  <option key={d.idDocente} value={d.idDocente}>
                    {nombreCompletoDocente(d)} — {d.numeroDocumento}
                  </option>
                ))}
              </select>
              {esRolEstudiante && (
                <p className="text-[12px] text-text-muted mt-1.5">No aplica para el rol Estudiante/Acudiente.</p>
              )}
            </div>
          </div>

                    <div className="mt-6">
            <label className="block text-[12px] font-semibold text-text-main mb-1">Estudiante/acudiente vinculado (opcional)</label>
            {estudianteBuscado ? (
              <div className="flex items-center justify-between px-3 py-2.5 border border-border-subtle rounded-lg bg-surface-container-low">
                <span className="text-[14px] text-text-main font-medium">
                  {nombreCompletoEstudiante(estudianteBuscado)} — {estudianteBuscado.numeroDocumento}
                </span>
                <button onClick={quitarEstudianteVinculado} className="text-[13px] text-error hover:underline">
                  Quitar
                </button>
              </div>
            ) : (
              <div
                className="flex gap-2"
                title={
                  !rolElegido
                    ? "Selecciona un rol primero."
                    : !esRolEstudiante
                    ? "No aplica: el rol seleccionado no es de estudiante/acudiente."
                    : undefined
                }
              >
                <input
                  type="text"
                  value={documentoEstudiante}
                  onChange={(e) => setDocumentoEstudiante(e.target.value)}
                  placeholder="Número de documento del estudiante"
                  disabled={!rolElegido || !esRolEstudiante}
                  className="flex-1 px-3 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] focus:ring-2 focus:ring-sidebar-active outline-none disabled:bg-surface-container-low disabled:text-text-muted disabled:cursor-not-allowed"
                />
                <button
                  onClick={buscarEstudiante}
                  disabled={buscandoEstudiante || !documentoEstudiante.trim() || !rolElegido || !esRolEstudiante}
                  className="px-4 py-2.5 rounded-lg text-[14px] font-semibold border border-border-subtle text-text-main hover:bg-surface-container-low disabled:opacity-50"
                >
                  {buscandoEstudiante ? "Buscando..." : "Buscar"}
                </button>
              </div>
            )}
            {errorBusquedaEstudiante && (
              <p className="text-[13px] text-error mt-1.5">{errorBusquedaEstudiante}</p>
            )}
            {rolElegido && !esRolEstudiante && (
              <p className="text-[12px] text-text-muted mt-1.5">No aplica para el rol seleccionado.</p>
            )}
          </div>
        </div>
      ) : (
        cuenta && (
          <div className="bg-white rounded-lg border border-border-subtle p-stack-lg mb-stack-md">
            <div className="flex items-center gap-2 mb-6 pb-3 border-b border-border-subtle">
              <span className="material-symbols-outlined text-sidebar-bg">manage_accounts</span>
              <h3 className="font-headline text-[18px] font-semibold text-on-primary-fixed">Datos de la cuenta</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              <CampoSoloLectura label="Nombre de usuario" valor={cuenta.nombreUsuario} />
              <CampoSoloLectura label="Rol" valor={cuenta.rolDenominacion} />
              <CampoSoloLectura label="Fecha de creación" valor={cuenta.fechaCreacion} />
              <div>
                <label className="block text-[12px] font-semibold text-text-main mb-1">Estado</label>
                <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                  cuenta.estado === "ACTIVO" ? "bg-status-success/10 text-status-success" : "bg-surface-alt text-text-muted"
                }`}>
                  {cuenta.estado === "ACTIVO" ? "Activo" : "Inactivo"}
                </span>
              </div>
              <CampoSoloLectura
                label="Docente vinculado"
                valor={docenteVinculado ? nombreCompletoDocente(docenteVinculado) : cuenta.idDocente ? `Docente #${cuenta.idDocente}` : "—"}
              />
              <CampoSoloLectura
                label="Estudiante/acudiente vinculado"
                valor={estudianteVinculado ? nombreCompletoEstudiante(estudianteVinculado) : cuenta.idEstudiante ? `Estudiante #${cuenta.idEstudiante}` : "—"}
              />
            </div>
          </div>
        )
      )}

      {modoCreacion && (
        <>
          {errorGuardado && (
            <div className="mb-stack-md text-[13px] text-error bg-error/10 border border-error/20 rounded-lg px-4 py-3">
              {errorGuardado}
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button
              onClick={guardar}
              disabled={guardando || !valido}
              className="px-6 py-2.5 rounded-lg text-[14px] font-semibold bg-sidebar-bg text-white hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {guardando ? "Creando..." : "Crear cuenta"}
            </button>
          </div>
        </>
      )}

      {confirmandoEstado && cuenta && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="font-headline text-[18px] font-semibold text-text-main mb-3">
              {cuenta.estado === "ACTIVO" ? "Inactivar cuenta" : "Activar cuenta"}
            </h3>
            <p className="text-[14px] text-text-muted mb-4">
              ¿Confirma {cuenta.estado === "ACTIVO" ? "inactivar" : "activar"} la cuenta {cuenta.nombreUsuario}?
              {cuenta.estado === "ACTIVO" && " El usuario ya no podrá iniciar sesión."}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmandoEstado(false)}
                disabled={cambiandoEstado}
                className="px-4 py-2 rounded-lg text-[14px] font-medium text-text-muted hover:bg-surface-container-low disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarCambioEstado}
                disabled={cambiandoEstado}
                className="px-4 py-2 rounded-lg text-[14px] font-semibold bg-sidebar-bg text-white hover:brightness-110 disabled:opacity-60"
              >
                {cambiandoEstado ? "Guardando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmandoEliminar && cuenta && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="font-headline text-[18px] font-semibold text-text-main mb-3">Eliminar cuenta</h3>
            <p className="text-[14px] text-text-muted mb-4">
              ¿Confirma eliminar la cuenta {cuenta.nombreUsuario}? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmandoEliminar(false)}
                disabled={eliminando}
                className="px-4 py-2 rounded-lg text-[14px] font-medium text-text-muted hover:bg-surface-container-low disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={eliminar}
                disabled={eliminando}
                className="px-4 py-2 rounded-lg text-[14px] font-semibold bg-error text-white hover:brightness-110 disabled:opacity-60"
              >
                {eliminando ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CampoSoloLectura({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-text-main mb-1">{label}</label>
      <p className="text-[14px] text-text-main font-medium">{valor || "—"}</p>
    </div>
  );
}