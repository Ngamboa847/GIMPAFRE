import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { listarPeriodos, crearPeriodo, actualizarPeriodo, eliminarPeriodo } from "./api";
import type { Periodo } from "./types";
import { listarAnosLectivos } from "../anos-lectivos/api";
import type { AnoLectivo } from "../anos-lectivos/types";
import { Modal } from "../../../shared/components/ui/Modal";
import { ApiError } from "../../../shared/api/client";

interface FormPeriodo {
  idAnoLectivo: string; // solo se usa al crear
  numero: string;
  denominacion: string;
  fechaInicio: string;
  fechaFin: string;
  porcentaje: string;
  estado: string;
}

const FORM_VACIO: FormPeriodo = {
  idAnoLectivo: "",
  numero: "",
  denominacion: "",
  fechaInicio: "",
  fechaFin: "",
  porcentaje: "",
  estado: "ACTIVO",
};

const ESTADOS = [
  { value: "ACTIVO", label: "Activo" },
  { value: "CERRADO", label: "Cerrado" },
];

export function PeriodosPage() {
  const navigate = useNavigate();
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [anosLectivos, setAnosLectivos] = useState<AnoLectivo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Periodo | null>(null);
  const [form, setForm] = useState<FormPeriodo>(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [confirmandoReapertura, setConfirmandoReapertura] = useState(false);

  const [aEliminar, setAEliminar] = useState<Periodo | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  async function cargar() {
    try {
      setCargando(true);
      const [periodosData, anosData] = await Promise.all([listarPeriodos(), listarAnosLectivos()]);
      setPeriodos(periodosData);
      setAnosLectivos(anosData);
      setError(null);
    } catch {
      setError("No se pudieron cargar los períodos.");
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
    setConfirmandoReapertura(false);
    setModalAbierto(true);
  }

  function abrirEditar(periodo: Periodo) {
    setEditando(periodo);
    setForm({
      idAnoLectivo: String(periodo.anoLectivo.idAnoLectivo),
      numero: String(periodo.numero),
      denominacion: periodo.denominacion,
      fechaInicio: periodo.fechaInicio,
      fechaFin: periodo.fechaFin,
      porcentaje: String(periodo.porcentaje),
      estado: periodo.estado,
    });
    setErrorForm(null);
    setConfirmandoReapertura(false);
    setModalAbierto(true);
  }

  function actualizarCampo(campo: keyof FormPeriodo, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function alCambiarEstado(v: string) {
    if (form.estado === "CERRADO" && v === "ACTIVO") {
      setConfirmandoReapertura(true);
    } else {
      actualizarCampo("estado", v);
    }
  }

  async function guardar() {
    setGuardando(true);
    setErrorForm(null);
    try {
      const datosBase = {
        numero: Number(form.numero),
        denominacion: form.denominacion,
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
        porcentaje: Number(form.porcentaje),
        estado: form.estado,
      };
      if (editando) {
        // Objeto COMPLETO (incluye el año lectivo sin cambiar) para no
        // arriesgarnos a que el PUT lo pise en null.
        const actualizado: Periodo = { ...editando, ...datosBase };
        await actualizarPeriodo(editando.idPeriodo, actualizado);
      } else {
        await crearPeriodo(datosBase, { idAnoLectivo: Number(form.idAnoLectivo) });
      }
      setModalAbierto(false);
      await cargar();
    } catch (err) {
      if (err instanceof ApiError) {
        const msg = (err.body as { mensaje?: string })?.mensaje ?? "No se pudo guardar el período.";
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
      await eliminarPeriodo(aEliminar.idPeriodo);
      setAEliminar(null);
      await cargar();
    } catch (err) {
      if (err instanceof ApiError) {
        const msg = (err.body as { mensaje?: string })?.mensaje ?? "No se pudo eliminar el período.";
        setErrorEliminar(msg);
      } else {
        setErrorEliminar("No se pudo conectar con el servidor.");
      }
    } finally {
      setEliminando(false);
    }
  }

  const bloqueadoPorCierre = form.estado === "CERRADO";
  const anosLectivosActivos = anosLectivos.filter((a) => a.estado === "ACTIVO");
  const formValido = editando
    ? form.numero.trim() !== "" && form.denominacion.trim() !== "" && form.fechaInicio !== "" && form.fechaFin !== "" && form.porcentaje.trim() !== ""
    : form.idAnoLectivo !== "" && form.numero.trim() !== "" && form.denominacion.trim() !== "" && form.fechaInicio !== "" && form.fechaFin !== "" && form.porcentaje.trim() !== "";

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
          <h1 className="font-headline text-[28px] font-bold text-text-main">Períodos</h1>
          <p className="font-body text-[14px] text-text-muted mt-1">Cortes académicos dentro de cada año lectivo</p>
        </div>
        <button
        onClick={abrirCrear}
        disabled={anosLectivosActivos.length === 0}
        title={anosLectivosActivos.length === 0 ? "No hay ningún año lectivo activo. Abrí o reabrí uno antes de crear períodos." : undefined}
        className="flex items-center gap-2 bg-sidebar-bg text-white px-4 py-2.5 rounded-lg hover:brightness-110 font-body text-[14px] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
        <span className="material-symbols-outlined">add</span>
        Nuevo período
        </button>
      </div>

      <div className="bg-white rounded-lg border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-container-low">
                {["N°", "Denominación", "Año lectivo", "Fecha inicio", "Fecha fin", "%", "Estado", ""].map((h) => (
                  <th key={h} className="px-4 py-3 font-body text-[12px] font-semibold text-text-muted uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-text-muted text-[14px]">Cargando...</td></tr>
              ) : error ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-error text-[14px]">{error}</td></tr>
              ) : periodos.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-text-muted text-[14px]">No hay períodos registrados.</td></tr>
              ) : (
                periodos.map((periodo) => (
                  <tr key={periodo.idPeriodo} className="border-b border-border-subtle last:border-0">
                    <td className="px-4 py-3 font-body text-[13px] text-text-main font-medium">{periodo.numero}</td>
                    <td className="px-4 py-3 font-body text-[13px] text-text-main">{periodo.denominacion}</td>
                    <td className="px-4 py-3 font-body text-[13px] text-text-muted">{periodo.anoLectivo?.denominacion ?? "—"}</td>
                    <td className="px-4 py-3 font-body text-[13px] text-text-muted">{periodo.fechaInicio}</td>
                    <td className="px-4 py-3 font-body text-[13px] text-text-muted">{periodo.fechaFin}</td>
                    <td className="px-4 py-3 font-body text-[13px] text-text-muted">{periodo.porcentaje}%</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        periodo.estado === "CERRADO" ? "bg-text-muted/10 text-text-muted" : "bg-status-success/10 text-status-success"
                      }`}>
                        {periodo.estado === "CERRADO" ? "Cerrado" : "Activo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => abrirEditar(periodo)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-surface-container-low transition-colors"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => setAEliminar(periodo)}
                          disabled={periodo.estado === "CERRADO"}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-error hover:bg-error/10 transition-colors disabled:text-text-muted/40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                          title={periodo.estado === "CERRADO" ? "No se puede eliminar un período cerrado" : "Eliminar"}
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
      </div>

      {modalAbierto && (
        <Modal titulo={editando ? "Editar período" : "Nuevo período"} onCerrar={() => setModalAbierto(false)}>
          <div className="space-y-4">
            {editando ? (
              <CampoLectura label="Año lectivo" valor={editando.anoLectivo?.denominacion ?? "—"} />
            ) : (
              <CampoSelect
                label="Año lectivo *"
                valor={form.idAnoLectivo}
                opciones={anosLectivosActivos.map((a) => ({ value: String(a.idAnoLectivo), label: a.denominacion }))}
                onChange={(v) => actualizarCampo("idAnoLectivo", v)}
                />
            )}

            <CampoSelect label="Estado *" valor={form.estado} opciones={ESTADOS} onChange={alCambiarEstado} />

            {confirmandoReapertura && (
              <div className="rounded-lg border border-status-warning/30 bg-status-warning/10 px-3 py-2">
                <p className="text-[12px] text-text-main mb-2">
                  ¿Confirmás reabrir este período? Se habilitará la edición de los demás campos.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setConfirmandoReapertura(false)}
                    className="text-[12px] font-medium text-text-muted hover:text-text-main px-2 py-1"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      actualizarCampo("estado", "ACTIVO");
                      setConfirmandoReapertura(false);
                    }}
                    className="text-[12px] font-semibold text-white bg-status-warning rounded-md px-3 py-1 hover:brightness-110"
                  >
                    Sí, reabrir
                  </button>
                </div>
              </div>
            )}

            {bloqueadoPorCierre && (
              <p className="text-[12px] text-text-muted bg-surface-container-low rounded-lg px-3 py-2">
                Este período está cerrado. Cambiá el estado a "Activo" para editar los demás campos.
              </p>
            )}

            <CampoTexto label="Número *" tipo="number" valor={form.numero} onChange={(v) => actualizarCampo("numero", v)} placeholder="Ej: 1" disabled={bloqueadoPorCierre} />
            <CampoTexto label="Denominación *" valor={form.denominacion} onChange={(v) => actualizarCampo("denominacion", v)} placeholder="Ej: Primer período" disabled={bloqueadoPorCierre} />
            <CampoTexto label="Fecha de inicio *" tipo="date" valor={form.fechaInicio} onChange={(v) => actualizarCampo("fechaInicio", v)} disabled={bloqueadoPorCierre} />
            <CampoTexto label="Fecha de fin *" tipo="date" valor={form.fechaFin} onChange={(v) => actualizarCampo("fechaFin", v)} disabled={bloqueadoPorCierre} />
            <CampoTexto label="Porcentaje *" tipo="number" valor={form.porcentaje} onChange={(v) => actualizarCampo("porcentaje", v)} placeholder="Ej: 25" disabled={bloqueadoPorCierre} />
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
        <Modal titulo="Eliminar período" onCerrar={() => setAEliminar(null)}>
          <p className="text-[14px] text-text-muted">
            ¿Confirma eliminar el período <strong>{aEliminar.denominacion}</strong>? Esta acción no se puede deshacer.
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

function CampoTexto({ label, valor, onChange, tipo = "text", placeholder, disabled }: { label: string; valor: string; onChange: (v: string) => void; tipo?: string; placeholder?: string; disabled?: boolean }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-text-main mb-1">{label}</label>
      <input
        type={tipo}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] focus:ring-2 focus:ring-sidebar-active outline-none disabled:bg-surface-container-low disabled:text-text-muted disabled:cursor-not-allowed"
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