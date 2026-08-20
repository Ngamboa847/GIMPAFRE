import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  listarAnosLectivos,
  crearAnoLectivo,
  actualizarAnoLectivo,
  eliminarAnoLectivo,
} from "./api";
import type { AnoLectivo } from "./types";
import { Modal } from "../../../shared/components/ui/Modal";
import { ApiError } from "../../../shared/api/client";

type FormAnoLectivo = Omit<AnoLectivo, "idAnoLectivo">;

const FORM_VACIO: FormAnoLectivo = {
  denominacion: "",
  fechaInicio: "",
  fechaFin: "",
  estado: "ACTIVO",
};

const ESTADOS = [
  { value: "ACTIVO", label: "Activo" },
  { value: "CERRADO", label: "Cerrado" },
];

function esVencido(fechaFin: string): boolean {
  if (!fechaFin) return false;
  
  return new Date(fechaFin) < new Date(new Date().toDateString());
}

export function AnosLectivosPage() {
  const navigate = useNavigate();
  const [anos, setAnos] = useState<AnoLectivo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<AnoLectivo | null>(null);
  const [form, setForm] = useState<FormAnoLectivo>(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const [aEliminar, setAEliminar] = useState<AnoLectivo | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);
  const [confirmandoReapertura, setConfirmandoReapertura] = useState(false);
  async function cargar() {
    try {
      setCargando(true);
      const datos = await listarAnosLectivos();
      setAnos(datos);
      setError(null);
    } catch {
      setError("No se pudieron cargar los años lectivos.");
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

function abrirEditar(ano: AnoLectivo) {
  setEditando(ano);
  setForm({
    denominacion: ano.denominacion,
    fechaInicio: ano.fechaInicio,
    fechaFin: ano.fechaFin,
    estado: ano.estado,
  });
  setErrorForm(null);
  setConfirmandoReapertura(false);
  setModalAbierto(true);
}

  function actualizarCampo(campo: keyof FormAnoLectivo, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function alCambiarEstado(v: string) {
  if (form.estado === "CERRADO" && v === "ACTIVO") {
    setConfirmandoReapertura(true); // pide confirmar antes de aplicar el cambio
  } else {
    actualizarCampo("estado", v);
  }
}

  async function guardar() {
    setGuardando(true);
    setErrorForm(null);
    try {
      if (editando) {
        await actualizarAnoLectivo(editando.idAnoLectivo, form);
      } else {
        await crearAnoLectivo(form);
      }
      setModalAbierto(false);
      await cargar();
    } catch (err) {
      if (err instanceof ApiError) {
        const msg = (err.body as { mensaje?: string })?.mensaje ?? "No se pudo guardar el año lectivo.";
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
      await eliminarAnoLectivo(aEliminar.idAnoLectivo);
      setAEliminar(null);
      await cargar();
    } catch (err) {
      if (err instanceof ApiError) {
        const msg = (err.body as { mensaje?: string })?.mensaje ?? "No se pudo eliminar el año lectivo.";
        setErrorEliminar(msg);
      } else {
        setErrorEliminar("No se pudo conectar con el servidor.");
      }
    } finally {
      setEliminando(false);
    }
  }

  const formValido = form.denominacion.trim() && form.fechaInicio && form.fechaFin;
  const bloqueadoPorCierre = form.estado === "CERRADO";
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
          <h1 className="font-headline text-[28px] font-bold text-text-main">Años lectivos</h1>
          <p className="font-body text-[14px] text-text-muted mt-1">Ciclos escolares y sus fechas</p>
        </div>
        <button
          onClick={abrirCrear}
          className="flex items-center gap-2 bg-sidebar-bg text-white px-4 py-2.5 rounded-lg hover:brightness-110 font-body text-[14px] font-semibold transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          Nuevo año lectivo
        </button>
      </div>

      <div className="bg-white rounded-lg border border-border-subtle overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-container-low">
              {["Denominación", "Fecha inicio", "Fecha fin", "Estado", ""].map((h) => (
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
            ) : anos.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-text-muted text-[14px]">No hay años lectivos registrados.</td></tr>
            ) : (
              anos.map((ano) => (
                <tr key={ano.idAnoLectivo} className="border-b border-border-subtle last:border-0">
                  <td className="px-4 py-3 font-body text-[13px] text-text-main font-medium">{ano.denominacion}</td>
                  <td className="px-4 py-3 font-body text-[13px] text-text-muted">{ano.fechaInicio}</td>
                  <td className="px-4 py-3 font-body text-[13px] text-text-muted">{ano.fechaFin}</td>
                  <td className="px-4 py-3">
  <div className="flex items-center gap-2">
    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${ano.estado === "CERRADO" ? "bg-text-muted/10 text-text-muted" : "bg-status-success/10 text-status-success"}`}>
      {ano.estado === "CERRADO" ? "Cerrado" : "Activo"}
    </span>
    {ano.estado !== "CERRADO" && esVencido(ano.fechaFin) && (
      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-status-warning/10 text-status-warning" title="La fecha de fin ya pasó">
        Vencido
      </span>
    )}
  </div>
</td>
                  <td className="px-4 py-3">
  <div className="flex items-center justify-end gap-1">
    <button
      onClick={() => abrirEditar(ano)}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-surface-container-low transition-colors"
      title="Editar"
    >
      <span className="material-symbols-outlined text-[18px]">edit</span>
    </button>
    <button
      onClick={() => setAEliminar(ano)}
      disabled={ano.estado === "CERRADO"}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-error hover:bg-error/10 transition-colors disabled:text-text-muted/40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
      title={ano.estado === "CERRADO" ? "No se puede eliminar un año cerrado" : "Eliminar"}
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
        <Modal titulo={editando ? "Editar año lectivo" : "Nuevo año lectivo"} onCerrar={() => setModalAbierto(false)}>
          <div className="space-y-4">
  <CampoSelect label="Estado *" valor={form.estado} opciones={ESTADOS} onChange={alCambiarEstado} />

{confirmandoReapertura && (
  <div className="rounded-lg border border-status-warning/30 bg-status-warning/10 px-3 py-2">
    <p className="text-[12px] text-text-main mb-2">
      ¿Confirmás reabrir este año lectivo? Se habilitará la edición de fechas y denominación.
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
      Este año está cerrado. Cambiá el estado a "Activo" para editar los demás campos.
    </p>
  )}
  <CampoTexto label="Denominación *" valor={form.denominacion} onChange={(v) => actualizarCampo("denominacion", v)} placeholder="Ej: 2027" disabled={bloqueadoPorCierre} />
  <CampoTexto label="Fecha de inicio *" tipo="date" valor={form.fechaInicio} onChange={(v) => actualizarCampo("fechaInicio", v)} disabled={bloqueadoPorCierre} />
  <CampoTexto label="Fecha de fin *" tipo="date" valor={form.fechaFin} onChange={(v) => actualizarCampo("fechaFin", v)} disabled={bloqueadoPorCierre} />
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
        <Modal titulo="Eliminar año lectivo" onCerrar={() => setAEliminar(null)}>
          <p className="text-[14px] text-text-muted">
            ¿Confirma eliminar el año lectivo <strong>{aEliminar.denominacion}</strong>? Esta acción no se puede deshacer.
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
        className="w-full px-3 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] focus:ring-2 focus:ring-sidebar-active outline-none disabled:bg-surface-container-low disabled:text-text-muted"
      />
    </div>
  );
}

function CampoSelect({ label, valor, opciones, onChange }: { label: string; valor: string; opciones: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-text-main mb-1">{label}</label>
      <select
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] bg-white focus:ring-2 focus:ring-sidebar-active outline-none"
      >
        {opciones.map((op) => (<option key={op.value} value={op.value}>{op.label}</option>))}
      </select>
    </div>
  );
}