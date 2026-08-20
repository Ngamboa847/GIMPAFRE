import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { listarGrupos, crearGrupo, actualizarGrupo, eliminarGrupo } from "./api";
import type { Grupo } from "./types";
import { listarAnosLectivos } from "../anos-lectivos/api";
import type { AnoLectivo } from "../anos-lectivos/types";
import { listarGrados } from "../grados/api";
import type { Grado } from "../grados/types";
import { Modal } from "../../../shared/components/ui/Modal";
import { ApiError } from "../../../shared/api/client";

interface FormGrupo {
  idAnoLectivo: string; // solo se usa al crear
  idGrado: string; // solo se usa al crear
  denominacion: string;
  cupoMaximo: string;
}

const FORM_VACIO: FormGrupo = {
  idAnoLectivo: "",
  idGrado: "",
  denominacion: "",
  cupoMaximo: "",
};

export function GruposPage() {
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [anosLectivos, setAnosLectivos] = useState<AnoLectivo[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Grupo | null>(null);
  const [form, setForm] = useState<FormGrupo>(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const [aEliminar, setAEliminar] = useState<Grupo | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  async function cargar() {
    try {
      setCargando(true);
      const [gruposData, anosData, gradosData] = await Promise.all([
        listarGrupos(),
        listarAnosLectivos(),
        listarGrados(),
      ]);
      setGrupos(gruposData);
      setAnosLectivos(anosData);
      setGrados(gradosData);
      setError(null);
    } catch {
      setError("No se pudieron cargar los grupos.");
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

  function abrirEditar(grupo: Grupo) {
    setEditando(grupo);
    setForm({
      idAnoLectivo: String(grupo.anoLectivo.idAnoLectivo),
      idGrado: String(grupo.grado.idGrado),
      denominacion: grupo.denominacion,
      cupoMaximo: String(grupo.cupoMaximo),
    });
    setErrorForm(null);
    setModalAbierto(true);
  }

  function actualizarCampo(campo: keyof FormGrupo, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function guardar() {
    setGuardando(true);
    setErrorForm(null);
    try {
      const cupo = Number(form.cupoMaximo);
      if (editando) {
        // Se manda el grupo COMPLETO (grado y año lectivo incluidos, sin
        // cambiar) para no arriesgarnos a que el PUT los pise en null —
        // mismo criterio que ya aplicamos con el estudiante.
        const actualizado: Grupo = {
          ...editando,
          denominacion: form.denominacion,
          cupoMaximo: cupo,
        };
        await actualizarGrupo(editando.idGrupo, actualizado);
      } else {
        await crearGrupo(
          { denominacion: form.denominacion, cupoMaximo: cupo },
          { idGrado: Number(form.idGrado), idAnoLectivo: Number(form.idAnoLectivo) }
        );
      }
      setModalAbierto(false);
      await cargar();
    } catch (err) {
      if (err instanceof ApiError) {
        const msg = (err.body as { mensaje?: string })?.mensaje ?? "No se pudo guardar el grupo.";
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
      await eliminarGrupo(aEliminar.idGrupo);
      setAEliminar(null);
      await cargar();
    } catch (err) {
      if (err instanceof ApiError) {
        const msg = (err.body as { mensaje?: string })?.mensaje ?? "No se pudo eliminar el grupo.";
        setErrorEliminar(msg);
      } else {
        setErrorEliminar("No se pudo conectar con el servidor.");
      }
    } finally {
      setEliminando(false);
    }
  }

  const cupoValido = form.cupoMaximo.trim() !== "" && Number(form.cupoMaximo) > 0;
  const formValido = editando
    ? form.denominacion.trim() !== "" && cupoValido
    : form.idAnoLectivo !== "" && form.idGrado !== "" && form.denominacion.trim() !== "" && cupoValido;

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
          <h1 className="font-headline text-[28px] font-bold text-text-main">Grupos</h1>
          <p className="font-body text-[14px] text-text-muted mt-1">Grupos por grado y año lectivo</p>
        </div>
        <button
          onClick={abrirCrear}
          className="flex items-center gap-2 bg-sidebar-bg text-white px-4 py-2.5 rounded-lg hover:brightness-110 font-body text-[14px] font-semibold transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          Nuevo grupo
        </button>
      </div>

      <div className="bg-white rounded-lg border border-border-subtle overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-container-low">
              {["Denominación", "Grado", "Año lectivo", "Cupo máximo", ""].map((h) => (
                <th key={h} className="px-4 py-3 font-body text-[12px] font-semibold text-text-muted uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-text-muted text-[14px]">Cargando...</td></tr>
            ) : error ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-error text-[14px]">{error}</td></tr>
            ) : grupos.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-text-muted text-[14px]">No hay grupos registrados.</td></tr>
            ) : (
              grupos.map((grupo) => (
                <tr key={grupo.idGrupo} className="border-b border-border-subtle last:border-0">
                  <td className="px-4 py-3 font-body text-[13px] text-text-main font-medium">{grupo.denominacion}</td>
                  <td className="px-4 py-3 font-body text-[13px] text-text-muted">{grupo.grado?.nombre ?? "—"}</td>
                  <td className="px-4 py-3 font-body text-[13px] text-text-muted">{grupo.anoLectivo?.denominacion ?? "—"}</td>
                  <td className="px-4 py-3 font-body text-[13px] text-text-muted">{grupo.cupoMaximo}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => abrirEditar(grupo)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-surface-container-low transition-colors"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => setAEliminar(grupo)}
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
        <Modal titulo={editando ? "Editar grupo" : "Nuevo grupo"} onCerrar={() => setModalAbierto(false)}>
          <div className="space-y-4">
            {editando ? (
              <>
                <CampoLectura label="Grado" valor={editando.grado?.nombre ?? "—"} />
                <CampoLectura label="Año lectivo" valor={editando.anoLectivo?.denominacion ?? "—"} />
              </>
            ) : (
              <>
                <CampoSelect
                  label="Año lectivo *"
                  valor={form.idAnoLectivo}
                  opciones={anosLectivos.map((a) => ({ value: String(a.idAnoLectivo), label: a.denominacion }))}
                  onChange={(v) => actualizarCampo("idAnoLectivo", v)}
                />
                <CampoSelect
                  label="Grado *"
                  valor={form.idGrado}
                  opciones={grados.map((g) => ({ value: String(g.idGrado), label: g.nombre }))}
                  onChange={(v) => actualizarCampo("idGrado", v)}
                />
              </>
            )}
            <CampoTexto label="Denominación *" valor={form.denominacion} onChange={(v) => actualizarCampo("denominacion", v)} placeholder="Ej: 6°A" />
            <CampoTexto label="Cupo máximo *" tipo="number" valor={form.cupoMaximo} onChange={(v) => actualizarCampo("cupoMaximo", v)} placeholder="Ej: 35" />
          </div>

          {editando && (
            <p className="mt-3 text-[12px] text-text-muted">
              El grado y el año lectivo no se pueden cambiar una vez creado el grupo.
            </p>
          )}

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
        <Modal titulo="Eliminar grupo" onCerrar={() => setAEliminar(null)}>
          <p className="text-[14px] text-text-muted">
            ¿Confirma eliminar el grupo <strong>{aEliminar.denominacion}</strong>? Esta acción no se puede deshacer.
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

function CampoTexto({ label, valor, onChange, tipo = "text", placeholder }: { label: string; valor: string; onChange: (v: string) => void; tipo?: string; placeholder?: string }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-text-main mb-1">{label}</label>
      <input
        type={tipo}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] focus:ring-2 focus:ring-sidebar-active outline-none"
      />
    </div>
  );
}

function CampoSelect({ label, valor, opciones, onChange }: { label: string; valor: string; opciones: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-text-main mb-1">{label}</label>
      <select value={valor} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] bg-white focus:ring-2 focus:ring-sidebar-active outline-none">
        <option value="">Seleccione...</option>
        {opciones.map((op) => (<option key={op.value} value={op.value}>{op.label}</option>))}
      </select>
    </div>
  );
}

function CampoLectura({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="text-[12px] text-text-muted uppercase tracking-wide mb-1">{label}</p>
      <p className="text-[14px] text-text-main font-medium">{valor}</p>
    </div>
  );
}