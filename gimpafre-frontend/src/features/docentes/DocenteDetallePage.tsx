import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { obtenerDocente, crearDocente, actualizarDocente, eliminarDocente } from "./api";
import type { Docente, DocenteEstado } from "./types";
import { ApiError } from "../../shared/api/client";

const DOCENTE_VACIO: Omit<Docente, "idDocente"> = {
  tipoDocumento: "CC",
  numeroDocumento: "",
  primerNombre: "",
  segundoNombre: "",
  primerApellido: "",
  segundoApellido: "",
  telefono: "",
  correo: "",
  formacionAcademica: "",
  estado: "ACTIVO",
};

// Docente es siempre un adulto — se restringe a los dos tipos de documento
// que aplican (a diferencia del selector de Estudiante, que incluye RC/TI).
const TIPOS_DOC = [
  { value: "CC", label: "C.C. - Cédula de Ciudadanía" },
  { value: "CE", label: "C.E. - Cédula de Extranjería" },
];

const ESTADOS = [
  { value: "ACTIVO", label: "Activo" },
  { value: "INACTIVO", label: "Inactivo" },
];

export function DocenteDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const modoCreacion = !id;

  const [docenteOriginal, setDocenteOriginal] = useState<Docente | null>(null);
  const [borrador, setBorrador] = useState<Omit<Docente, "idDocente">>(DOCENTE_VACIO);
  const [cargando, setCargando] = useState(!modoCreacion);
  const [error, setError] = useState<string | null>(null);
  const [editando, setEditando] = useState(modoCreacion);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);

  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    if (modoCreacion) return;
    let activo = true;
    obtenerDocente(Number(id))
      .then((data) => {
        if (!activo) return;
        setDocenteOriginal(data);
        setBorrador(data);
        setCargando(false);
      })
      .catch(() => {
        if (activo) {
          setError("No se pudo cargar el docente.");
          setCargando(false);
        }
      });
    return () => {
      activo = false;
    };
  }, [id, modoCreacion]);

  function actualizarCampo(campo: keyof Omit<Docente, "idDocente">, valor: string) {
    setBorrador((prev) => ({ ...prev, [campo]: valor }));
  }

  const valido =
    borrador.tipoDocumento.trim() &&
    borrador.numeroDocumento.trim() &&
    borrador.primerNombre.trim() &&
    borrador.primerApellido.trim();

  // Al editar, parte de la copia completa cargada por GET (docenteOriginal)
  // y la reenvía completa de vuelta (D-F2) — no solo los campos tocados.
  async function guardar() {
    if (!valido) return;
    setGuardando(true);
    setErrorGuardado(null);
    try {
      if (modoCreacion) {
        const creado = await crearDocente(borrador);
        navigate(`/docentes/${creado.idDocente}`);
      } else if (docenteOriginal) {
        const datos: Docente = { ...docenteOriginal, ...borrador };
        const actualizado = await actualizarDocente(docenteOriginal.idDocente, datos);
        setDocenteOriginal(actualizado);
        setBorrador(actualizado);
        setEditando(false);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setErrorGuardado("Ya existe un docente con ese número de documento.");
        } else {
          setErrorGuardado((err.body as { mensaje?: string })?.mensaje ?? "No se pudo guardar el docente.");
        }
      } else {
        setErrorGuardado("No se pudo conectar con el servidor.");
      }
    } finally {
      setGuardando(false);
    }
  }

  function cancelarEdicion() {
    if (docenteOriginal) setBorrador(docenteOriginal);
    setErrorGuardado(null);
    setEditando(false);
  }

  async function eliminar() {
    if (!docenteOriginal) return;
    setEliminando(true);
    try {
      await eliminarDocente(docenteOriginal.idDocente);
      navigate("/docentes");
    } catch {
      setError("No se pudo eliminar el docente. Intenta de nuevo.");
      setConfirmandoEliminar(false);
    } finally {
      setEliminando(false);
    }
  }

  if (cargando) {
    return <p className="text-text-muted text-[14px]">Cargando docente...</p>;
  }
  if (error && !modoCreacion && !docenteOriginal) {
    return (
      <div>
        <p className="text-error text-[14px] mb-4">{error}</p>
        <button onClick={() => navigate("/docentes")} className="text-sidebar-bg text-[14px] underline">
          Volver al listado
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => navigate("/docentes")}
        className="flex items-center gap-1 text-text-muted text-[13px] hover:text-text-main mb-4"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Volver a Docentes
      </button>

      <div className="flex items-center justify-between mb-stack-lg">
        <h1 className="font-headline text-[28px] font-bold text-text-main">
          {modoCreacion ? "Nuevo docente" : `${borrador.primerNombre} ${borrador.primerApellido}`}
        </h1>
        {!modoCreacion && !editando && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditando(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold bg-sidebar-bg text-white hover:brightness-110 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Editar
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

      <div className="bg-white rounded-lg border border-border-subtle p-stack-lg mb-stack-md">
        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-border-subtle">
          <span className="material-symbols-outlined text-sidebar-bg">person</span>
          <h3 className="font-headline text-[18px] font-semibold text-on-primary-fixed">Datos del docente</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          <CampoEditable label="Primer nombre *" valor={borrador.primerNombre} editando={editando} onChange={(v) => actualizarCampo("primerNombre", v)} />
          <CampoEditable label="Segundo nombre" valor={borrador.segundoNombre ?? ""} editando={editando} onChange={(v) => actualizarCampo("segundoNombre", v)} />
          <CampoEditable label="Primer apellido *" valor={borrador.primerApellido} editando={editando} onChange={(v) => actualizarCampo("primerApellido", v)} />
          <CampoEditable label="Segundo apellido" valor={borrador.segundoApellido ?? ""} editando={editando} onChange={(v) => actualizarCampo("segundoApellido", v)} />
          <CampoSelectEditable
            label="Tipo de documento *"
            valor={borrador.tipoDocumento}
            opciones={TIPOS_DOC}
            editando={editando}
            onChange={(v) => actualizarCampo("tipoDocumento", v)}
          />
          <CampoEditable label="Número de documento *" valor={borrador.numeroDocumento} editando={editando} onChange={(v) => actualizarCampo("numeroDocumento", v)} />
          <CampoEditable label="Teléfono" valor={borrador.telefono ?? ""} editando={editando} onChange={(v) => actualizarCampo("telefono", v)} />
          <CampoEditable label="Correo" valor={borrador.correo ?? ""} editando={editando} onChange={(v) => actualizarCampo("correo", v)} />
          <CampoSelectEditable
            label="Estado *"
            valor={borrador.estado}
            opciones={ESTADOS}
            editando={editando}
            onChange={(v) => actualizarCampo("estado", v as DocenteEstado)}
          />
        </div>
        <div className="mt-6">
          <label className="block text-[12px] font-semibold text-text-main mb-1">Formación académica</label>
          {editando ? (
            <textarea
              value={borrador.formacionAcademica ?? ""}
              onChange={(e) => actualizarCampo("formacionAcademica", e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] focus:ring-2 focus:ring-sidebar-active outline-none"
            />
          ) : (
            <p className="text-[14px] text-text-main">{borrador.formacionAcademica || "—"}</p>
          )}
        </div>
      </div>

      {errorGuardado && (
        <div className="mb-stack-md text-[13px] text-error bg-error/10 border border-error/20 rounded-lg px-4 py-3">
          {errorGuardado}
        </div>
      )}

      {editando && (
        <div className="flex justify-end gap-3">
          {!modoCreacion && (
            <button
              onClick={cancelarEdicion}
              disabled={guardando}
              className="px-6 py-2.5 rounded-lg text-[14px] font-semibold border border-border-subtle text-text-muted hover:bg-surface-container-low disabled:opacity-50"
            >
              Cancelar
            </button>
          )}
          <button
            onClick={guardar}
            disabled={guardando || !valido}
            className="px-6 py-2.5 rounded-lg text-[14px] font-semibold bg-sidebar-bg text-white hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {guardando ? "Guardando..." : modoCreacion ? "Crear docente" : "Guardar cambios"}
          </button>
        </div>
      )}

      {confirmandoEliminar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="font-headline text-[18px] font-semibold text-text-main mb-3">Eliminar docente</h3>
            <p className="text-[14px] text-text-muted mb-4">
              ¿Confirma eliminar a {borrador.primerNombre} {borrador.primerApellido}? Esta acción no se puede deshacer.
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

function CampoEditable({ label, valor, editando, onChange }: { label: string; valor: string; editando: boolean; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-text-main mb-1">{label}</label>
      {editando ? (
        <input
          type="text"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] focus:ring-2 focus:ring-sidebar-active outline-none"
        />
      ) : (
        <p className="text-[14px] text-text-main font-medium">{valor || "—"}</p>
      )}
    </div>
  );
}

function CampoSelectEditable({ label, valor, opciones, editando, onChange }: { label: string; valor: string; opciones: { value: string; label: string }[]; editando: boolean; onChange: (v: string) => void }) {
  const actual = opciones.find((o) => o.value === valor);
  return (
    <div>
      <label className="block text-[12px] font-semibold text-text-main mb-1">{label}</label>
      {editando ? (
        <select
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] bg-white focus:ring-2 focus:ring-sidebar-active outline-none"
        >
          {opciones.map((op) => (<option key={op.value} value={op.value}>{op.label}</option>))}
        </select>
      ) : (
        <p className="text-[14px] text-text-main font-medium">{actual?.label ?? valor}</p>
      )}
    </div>
  );
}
