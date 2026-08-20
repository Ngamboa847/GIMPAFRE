import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { listarRoles, crearRol, actualizarRol, eliminarRol } from "./api";
import type { Rol } from "./types";
import { Modal } from "../../../shared/components/ui/Modal";
import { ApiError } from "../../../shared/api/client";

type FormRol = Omit<Rol, "idRol">;

const FORM_VACIO: FormRol = {
  codigo: "",
  denominacion: "",
};

export function RolesPage() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Rol[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Rol | null>(null);
  const [form, setForm] = useState<FormRol>(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const [aEliminar, setAEliminar] = useState<Rol | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  async function cargar() {
    try {
      setCargando(true);
      const datos = await listarRoles();
      setRoles(datos);
      setError(null);
    } catch {
      setError("No se pudieron cargar los roles.");
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

  function abrirEditar(rol: Rol) {
    setEditando(rol);
    setForm({ codigo: rol.codigo, denominacion: rol.denominacion });
    setErrorForm(null);
    setModalAbierto(true);
  }

  function actualizarCampo(campo: keyof FormRol, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function guardar() {
    setGuardando(true);
    setErrorForm(null);
    try {
      if (editando) {
        await actualizarRol(editando.idRol, form);
      } else {
        await crearRol(form);
      }
      setModalAbierto(false);
      await cargar();
    } catch (err) {
      if (err instanceof ApiError) {
        const msg = (err.body as { mensaje?: string })?.mensaje ?? "No se pudo guardar el rol.";
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
      await eliminarRol(aEliminar.idRol);
      setAEliminar(null);
      await cargar();
    } catch (err) {
      if (err instanceof ApiError) {
        const msg = (err.body as { mensaje?: string })?.mensaje ?? "No se pudo eliminar el rol.";
        setErrorEliminar(msg);
      } else {
        setErrorEliminar("No se pudo conectar con el servidor.");
      }
    } finally {
      setEliminando(false);
    }
  }

  const formValido = form.codigo.trim() !== "" && form.denominacion.trim() !== "";

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
          <h1 className="font-headline text-[28px] font-bold text-text-main">Roles</h1>
          <p className="font-body text-[14px] text-text-muted mt-1">Roles del sistema y su denominación</p>
        </div>
        <button
          onClick={abrirCrear}
          className="flex items-center gap-2 bg-sidebar-bg text-white px-4 py-2.5 rounded-lg hover:brightness-110 font-body text-[14px] font-semibold transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          Nuevo rol
        </button>
      </div>

      <div className="bg-white rounded-lg border border-border-subtle overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-container-low">
              {["Código", "Denominación", ""].map((h) => (
                <th key={h} className="px-4 py-3 font-body text-[12px] font-semibold text-text-muted uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={3} className="px-4 py-12 text-center text-text-muted text-[14px]">Cargando...</td></tr>
            ) : error ? (
              <tr><td colSpan={3} className="px-4 py-12 text-center text-error text-[14px]">{error}</td></tr>
            ) : roles.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-12 text-center text-text-muted text-[14px]">No hay roles registrados.</td></tr>
            ) : (
              roles.map((rol) => (
                <tr key={rol.idRol} className="border-b border-border-subtle last:border-0">
                  <td className="px-4 py-3 font-body text-[13px] text-text-main font-medium">{rol.codigo}</td>
                  <td className="px-4 py-3 font-body text-[13px] text-text-muted">{rol.denominacion}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => abrirEditar(rol)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-surface-container-low transition-colors"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => setAEliminar(rol)}
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
        <Modal titulo={editando ? "Editar rol" : "Nuevo rol"} onCerrar={() => setModalAbierto(false)}>
          <div className="space-y-4">
            <CampoTexto label="Código *" valor={form.codigo} onChange={(v) => actualizarCampo("codigo", v)} placeholder="Ej: RECTORA (sin tildes ni espacios)" />
            <CampoTexto label="Denominación *" valor={form.denominacion} onChange={(v) => actualizarCampo("denominacion", v)} placeholder="Ej: Rectora" />
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
        <Modal titulo="Eliminar rol" onCerrar={() => setAEliminar(null)}>
          <p className="text-[14px] text-text-muted">
            ¿Confirma eliminar el rol <strong>{aEliminar.denominacion}</strong>? Esta acción no se puede deshacer.
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

function CampoTexto({ label, valor, onChange, placeholder }: { label: string; valor: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-text-main mb-1">{label}</label>
      <input
        type="text"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] focus:ring-2 focus:ring-sidebar-active outline-none"
      />
    </div>
  );
}