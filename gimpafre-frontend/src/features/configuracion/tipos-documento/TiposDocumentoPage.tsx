import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  listarTiposDocumento,
  crearTipoDocumento,
  actualizarTipoDocumento,
  eliminarTipoDocumento,
} from "./api";
import type { TipoDocumento } from "./types";
import { Modal } from "../../../shared/components/ui/Modal";
import { ApiError } from "../../../shared/api/client";

interface FormTipoDocumento {
  nombre: string;
  obligatorio: boolean;
  activo: boolean;
}

const FORM_VACIO: FormTipoDocumento = {
  nombre: "",
  obligatorio: false,
  activo: true,
};

export function TiposDocumentoPage() {
  const navigate = useNavigate();
  const [tipos, setTipos] = useState<TipoDocumento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<TipoDocumento | null>(null);
  const [form, setForm] = useState<FormTipoDocumento>(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const [aEliminar, setAEliminar] = useState<TipoDocumento | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  async function cargar() {
    try {
      setCargando(true);
      const datos = await listarTiposDocumento();
      setTipos(datos);
      setError(null);
    } catch {
      setError("No se pudieron cargar los tipos de documento.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function abrirCrear() {
    setEditando(null);
    setForm(FORM_VACIO);
    setErrorForm(null);
    setModalAbierto(true);
  }

  function abrirEditar(tipo: TipoDocumento) {
    setEditando(tipo);
    setForm({ nombre: tipo.nombre, obligatorio: tipo.obligatorio, activo: tipo.activo });
    setErrorForm(null);
    setModalAbierto(true);
  }

  function actualizarNombre(valor: string) {
    setForm((prev) => ({ ...prev, nombre: valor }));
  }

  function actualizarBooleano(campo: "obligatorio" | "activo", valor: boolean) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function guardar() {
    setGuardando(true);
    setErrorForm(null);
    try {
      if (editando) {
        await actualizarTipoDocumento(editando.idTipoDocumento, form);
      } else {
        await crearTipoDocumento(form);
      }
      setModalAbierto(false);
      await cargar();
    } catch (err) {
      if (err instanceof ApiError) {
        const msg = (err.body as { mensaje?: string })?.mensaje ?? "No se pudo guardar el tipo de documento.";
        setErrorForm(msg);
      } else {
        setErrorForm("No se pudo conectar con el servidor.");
      }
    } finally {
      setGuardando(false);
    }
  }

  async function confirmarEliminar() {
    if (!aEliminar) return;
    setEliminando(true);
    setErrorEliminar(null);
    try {
      await eliminarTipoDocumento(aEliminar.idTipoDocumento);
      setAEliminar(null);
      await cargar();
    } catch (err) {
      if (err instanceof ApiError) {
        const msg = (err.body as { mensaje?: string })?.mensaje ?? "No se pudo eliminar el tipo de documento.";
        setErrorEliminar(msg);
      } else {
        setErrorEliminar("No se pudo conectar con el servidor.");
      }
    } finally {
      setEliminando(false);
    }
  }

  const formValido = form.nombre.trim() !== "";

  return (
    <>
      <button
        onClick={() => navigate("/configuracion")}
        className="flex items-center gap-1 text-text-muted text-[13px] hover:text-text-main mb-4"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Volver a Configuración
      </button>

      <div className="flex justify-between items-start mb-stack-md">
        <div>
          <h1 className="font-headline text-[28px] font-bold text-text-main">Tipos de documento</h1>
          <p className="font-body text-[14px] text-text-muted mt-1">Documentos anexos requeridos en matrícula</p>
        </div>
        <button
          onClick={abrirCrear}
          className="flex items-center gap-2 bg-sidebar-bg text-white px-4 py-2.5 rounded-lg hover:brightness-110 font-body text-[14px] font-semibold transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          Nuevo tipo de documento
        </button>
      </div>

      <div className="bg-white rounded-lg border border-border-subtle overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-container-low">
              {["Nombre", "Obligatorio", "Estado", ""].map((h) => (
                <th key={h} className="px-4 py-3 font-body text-[12px] font-semibold text-text-muted uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-text-muted text-[14px]">Cargando...</td></tr>
            ) : error ? (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-error text-[14px]">{error}</td></tr>
            ) : tipos.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-text-muted text-[14px]">No hay tipos de documento registrados.</td></tr>
            ) : (
              tipos.map((tipo) => (
                <tr key={tipo.idTipoDocumento} className="border-b border-border-subtle last:border-0">
                  <td className="px-4 py-3 font-body text-[13px] text-text-main font-medium">{tipo.nombre}</td>
                  <td className="px-4 py-3">
                    {tipo.obligatorio ? (
                      <span className="text-[12px] font-semibold text-status-warning">Sí</span>
                    ) : (
                      <span className="text-[12px] text-text-muted">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      tipo.activo ? "bg-status-success/10 text-status-success" : "bg-text-muted/10 text-text-muted"
                    }`}>
                      {tipo.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => abrirEditar(tipo)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-surface-container-low transition-colors"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => setAEliminar(tipo)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-error hover:bg-error/10 transition-colors"
                        title="Eliminar"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <Modal titulo={editando ? "Editar tipo de documento" : "Nuevo tipo de documento"} onCerrar={() => setModalAbierto(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-text-main mb-1">Nombre *</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => actualizarNombre(e.target.value)}
                placeholder="Ej: Fotocopia registro civil"
                className="w-full px-3 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] focus:ring-2 focus:ring-sidebar-active outline-none"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.obligatorio}
                  onChange={(e) => actualizarBooleano("obligatorio", e.target.checked)}
                  className="w-4 h-4 rounded border-border-subtle text-sidebar-bg focus:ring-sidebar-active"
                />
                <span className="text-[14px] text-text-main">Obligatorio para matricular</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={(e) => actualizarBooleano("activo", e.target.checked)}
                  className="w-4 h-4 rounded border-border-subtle text-sidebar-bg focus:ring-sidebar-active"
                />
                <span className="text-[14px] text-text-main">Activo</span>
              </label>
            </div>
          </div>

          {errorForm && (
            <div className="mt-4 text-[13px] text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">
              {errorForm}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setModalAbierto(false)}
              disabled={guardando}
              className="px-4 py-2 rounded-lg text-[14px] font-medium text-text-muted hover:bg-surface-container-low disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={guardar}
              disabled={guardando || !formValido}
              className="px-4 py-2 rounded-lg text-[14px] font-semibold bg-sidebar-bg text-white hover:brightness-110 disabled:opacity-50"
            >
              {guardando ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </Modal>
      )}

      {aEliminar && (
        <Modal titulo="Eliminar tipo de documento" onCerrar={() => setAEliminar(null)}>
          <p className="text-[14px] text-text-muted">
            ¿Confirma eliminar <strong>{aEliminar.nombre}</strong>? Esta acción no se puede deshacer.
          </p>

          {errorEliminar && (
            <div className="mt-4 text-[13px] text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">
              {errorEliminar}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setAEliminar(null)}
              disabled={eliminando}
              className="px-4 py-2 rounded-lg text-[14px] font-medium text-text-muted hover:bg-surface-container-low disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={confirmarEliminar}
              disabled={eliminando}
              className="px-4 py-2 rounded-lg text-[14px] font-semibold bg-error text-white hover:brightness-110 disabled:opacity-50"
            >
              {eliminando ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}