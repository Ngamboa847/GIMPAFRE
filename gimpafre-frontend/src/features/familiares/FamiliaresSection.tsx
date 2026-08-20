import { useEffect, useState } from "react";
import type { Estudiante } from "../estudiantes/types";
import type { Familiar, EstudianteFamiliar } from "./types";
import {
  listarFamiliaresPorEstudiante,
  buscarFamiliarPorDocumento,
  crearFamiliar,
  actualizarFamiliar,
  crearVinculoFamiliar,
  actualizarVinculoFamiliar,
} from "./api";
import { Modal } from "../../shared/components/ui/Modal";
import { ApiError } from "../../shared/api/client";

const TIPOS_DOC = [
  { value: "RC", label: "R.C. - Registro Civil" },
  { value: "TI", label: "T.I. - Tarjeta de Identidad" },
  { value: "CC", label: "C.C. - Cédula de Ciudadanía" },
  { value: "CE", label: "C.E. - Cédula de Extranjería" },
];

const PARENTESCOS = [
  { value: "Padre", label: "Padre" },
  { value: "Madre", label: "Madre" },
  { value: "Acudiente", label: "Acudiente" },
  { value: "Otro", label: "Otro" },
];

function nombreCompletoFamiliar(f: Familiar): string {
  return [f.primerNombre, f.segundoNombre, f.primerApellido, f.segundoApellido]
    .filter(Boolean)
    .join(" ");
}

function familiarVacio(tipoDocumento: string, numeroDocumento: string): Familiar {
  return {
    tipoDocumento,
    numeroDocumento,
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    direccion: "",
    telefono: "",
    ocupacion: "",
    empresa: "",
    estadoCivil: "",
  };
}

export function FamiliaresSection({ estudiante, editando }: { estudiante: Estudiante; editando: boolean }) {
  const idEstudiante = estudiante.idEstudiante!;

  const [familiares, setFamiliares] = useState<EstudianteFamiliar[] | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mostrarAgregar, setMostrarAgregar] = useState(false);
  const [editandoFamiliar, setEditandoFamiliar] = useState<EstudianteFamiliar | null>(null);
  const [viendoDetalle, setViendoDetalle] = useState<EstudianteFamiliar | null>(null);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      setCargando(true);
      setError(null);
      try {
        const datos = await listarFamiliaresPorEstudiante(idEstudiante);
        if (activo) setFamiliares(datos);
      } catch {
        if (activo) setError("No se pudo cargar los familiares del estudiante.");
      } finally {
        if (activo) setCargando(false);
      }
    }
    cargar();
    return () => {
      activo = false;
    };
  }, [idEstudiante]);

  return (
    <div className="bg-white rounded-lg border border-border-subtle p-stack-lg mb-stack-md">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sidebar-bg">family_restroom</span>
          <h3 className="font-headline text-[18px] font-semibold text-on-primary-fixed">Familiares / Acudientes</h3>
        </div>
        <button
          onClick={() => setMostrarAgregar(true)}
          disabled={!editando}
          title={!editando ? "Habilita la edición del estudiante para agregar familiares" : undefined}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-semibold bg-sidebar-bg text-white hover:brightness-110 transition-all disabled:opacity-50 disabled:hover:brightness-100"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Agregar
        </button>
      </div>

      {cargando && <p className="text-text-muted text-[14px]">Cargando familiares...</p>}
      {error && <p className="text-error text-[14px]">{error}</p>}

      {!cargando && !error && familiares && familiares.length === 0 && (
        <p className="text-text-muted text-[14px]">Sin familiares registrados aún.</p>
      )}

      {!cargando && !error && familiares && familiares.length > 0 && (
        <table className="w-full text-[14px]">
          <thead>
            <tr className="text-left text-[12px] text-text-muted uppercase tracking-wide border-b border-border-subtle">
              <th className="py-2 pr-3">Nombre completo</th>
              <th className="py-2 pr-3">Documento</th>
              <th className="py-2 pr-3">Parentesco</th>
              <th className="py-2 pr-3">Acudiente</th>
              <th className="py-2 pr-3">Celular de contacto</th>
              <th className="py-2 pr-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {familiares.map((vinculo) => (
              <tr key={vinculo.idEstudianteFamiliar} className="border-b border-border-subtle last:border-0">
                <td className="py-2.5 pr-3 font-medium text-text-main">{nombreCompletoFamiliar(vinculo.familiar)}</td>
                <td className="py-2.5 pr-3 text-text-muted">
                  {vinculo.familiar.tipoDocumento ?? "—"} {vinculo.familiar.numeroDocumento ?? ""}
                </td>
                <td className="py-2.5 pr-3 text-text-muted">{vinculo.parentesco}</td>
                <td className="py-2.5 pr-3 text-text-muted">{vinculo.esAcudiente ? "Sí" : "No"}</td>
                <td className="py-2.5 pr-3 text-text-muted">{vinculo.familiar.telefono || "—"}</td>
                <td className="py-2.5 pr-3 text-right">
                  <button onClick={() => setViendoDetalle(vinculo)} className="text-text-muted hover:text-sidebar-bg mr-2" title="Ver detalle">
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                  </button>
                  <button
                    onClick={() => setEditandoFamiliar(vinculo)}
                    disabled={!editando}
                    title={!editando ? "Habilita la edición del estudiante para modificar familiares" : "Modificar"}
                    className="text-text-muted hover:text-sidebar-bg disabled:opacity-40 disabled:hover:text-text-muted"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {mostrarAgregar && (
        <ModalAgregarFamiliar
          estudiante={estudiante}
          onCerrar={() => setMostrarAgregar(false)}
          onGuardado={(nuevo) => {
            setFamiliares((prev) => (prev ? [...prev, nuevo] : [nuevo]));
            setMostrarAgregar(false);
          }}
        />
      )}

      {editandoFamiliar && (
        <ModalEditarFamiliar
          vinculo={editandoFamiliar}
          onCerrar={() => setEditandoFamiliar(null)}
          onGuardado={(actualizado) => {
            setFamiliares((prev) =>
              prev ? prev.map((v) => (v.idEstudianteFamiliar === actualizado.idEstudianteFamiliar ? actualizado : v)) : prev
            );
            setEditandoFamiliar(null);
          }}
        />
      )}

      {viendoDetalle && <ModalDetalleFamiliar vinculo={viendoDetalle} onCerrar={() => setViendoDetalle(null)} />}
    </div>
  );
}

/* ---------- Modal: agregar (busca por documento; si existe, permite actualizar) ---------- */

function ModalAgregarFamiliar({
  estudiante,
  onCerrar,
  onGuardado,
}: {
  estudiante: Estudiante;
  onCerrar: () => void;
  onGuardado: (nuevo: EstudianteFamiliar) => void;
}) {
  const [tipoDocumento, setTipoDocumento] = useState("CC");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [yaExiste, setYaExiste] = useState<boolean | null>(null);
  const [borrador, setBorrador] = useState<Familiar | null>(null);
  const [parentesco, setParentesco] = useState("Padre");
  const [esAcudiente, setEsAcudiente] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);

  async function alSalirDeDocumento() {
    if (!numeroDocumento.trim()) return;
    setBuscando(true);
    setErrorGuardado(null);
    try {
      const encontrado = await buscarFamiliarPorDocumento(numeroDocumento.trim());
      if (encontrado) {
        setBorrador(encontrado);
        setYaExiste(true);
      } else {
        setBorrador(familiarVacio(tipoDocumento, numeroDocumento.trim()));
        setYaExiste(false);
      }
    } catch {
      setErrorGuardado("No se pudo buscar el familiar. Intenta de nuevo.");
    } finally {
      setBuscando(false);
    }
  }

  function actualizarCampo(campo: keyof Familiar, valor: string) {
    setBorrador((prev) => (prev ? { ...prev, [campo]: valor } : prev));
  }

  async function guardar() {
    if (!borrador) return;
    setGuardando(true);
    setErrorGuardado(null);
    try {
      const familiarGuardado =
        yaExiste && borrador.idFamiliar
          ? await actualizarFamiliar(borrador.idFamiliar, borrador)
          : await crearFamiliar(borrador);

      const vinculo: EstudianteFamiliar = {
        estudiante,
        familiar: familiarGuardado,
        parentesco,
        esAcudiente,
      };
      const creado = await crearVinculoFamiliar(estudiante.idEstudiante!, familiarGuardado.idFamiliar!, vinculo);
      onGuardado(creado);
    } catch (err) {
      if (err instanceof ApiError) {
        const msg = (err.body as { mensaje?: string })?.mensaje ?? "No se pudo guardar el familiar.";
        setErrorGuardado(msg);
      } else {
        setErrorGuardado("No se pudo conectar con el servidor.");
      }
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal titulo="Agregar familiar" onCerrar={onCerrar} ancho="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <CampoSelect label="Tipo de documento" valor={tipoDocumento} opciones={TIPOS_DOC} onChange={setTipoDocumento} />
          <div>
            <label className="block text-[12px] font-semibold text-text-main mb-1">Número de documento</label>
            <input
              type="text"
              value={numeroDocumento}
              onChange={(e) => setNumeroDocumento(e.target.value)}
              onBlur={alSalirDeDocumento}
              className="w-full px-3 py-2.5 border border-border-subtle rounded-lg text-[14px] focus:ring-2 focus:ring-sidebar-active outline-none"
            />
          </div>
        </div>

        {buscando && <p className="text-text-muted text-[13px]">Buscando familiar...</p>}
        {yaExiste === true && (
          <p className="text-[13px] text-sidebar-bg bg-sidebar-bg/10 rounded-lg px-3 py-2">
            Ya existe un familiar con este documento — revisa y actualiza sus datos si hace falta.
          </p>
        )}
        {yaExiste === false && (
          <p className="text-[13px] text-text-muted bg-surface-container-low rounded-lg px-3 py-2">
            No existe un familiar con este documento — se creará uno nuevo.
          </p>
        )}

        {borrador && (
          <div className="grid grid-cols-2 gap-4">
            <CampoTexto label="Primer nombre *" valor={borrador.primerNombre} onChange={(v) => actualizarCampo("primerNombre", v)} />
            <CampoTexto label="Segundo nombre" valor={borrador.segundoNombre ?? ""} onChange={(v) => actualizarCampo("segundoNombre", v)} />
            <CampoTexto label="Primer apellido *" valor={borrador.primerApellido} onChange={(v) => actualizarCampo("primerApellido", v)} />
            <CampoTexto label="Segundo apellido" valor={borrador.segundoApellido ?? ""} onChange={(v) => actualizarCampo("segundoApellido", v)} />
            <CampoTexto label="Dirección" valor={borrador.direccion ?? ""} onChange={(v) => actualizarCampo("direccion", v)} />
            <CampoTexto label="Teléfono" valor={borrador.telefono ?? ""} onChange={(v) => actualizarCampo("telefono", v)} />
            <CampoTexto label="Ocupación" valor={borrador.ocupacion ?? ""} onChange={(v) => actualizarCampo("ocupacion", v)} />
            <CampoTexto label="Empresa" valor={borrador.empresa ?? ""} onChange={(v) => actualizarCampo("empresa", v)} />
            <CampoTexto label="Estado civil" valor={borrador.estadoCivil ?? ""} onChange={(v) => actualizarCampo("estadoCivil", v)} />
            <CampoSelect label="Parentesco *" valor={parentesco} opciones={PARENTESCOS} onChange={setParentesco} />
            <label className="flex items-center gap-2 text-[13px] text-text-main pb-2.5 col-span-2">
              <input type="checkbox" checked={esAcudiente} onChange={(e) => setEsAcudiente(e.target.checked)} />
              Es acudiente
            </label>
          </div>
        )}

        {errorGuardado && <p className="text-error text-[13px]">{errorGuardado}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onCerrar} disabled={guardando} className="px-4 py-2 rounded-lg text-[13px] font-semibold border border-border-subtle text-text-muted hover:bg-surface-container-low disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={guardar} disabled={!borrador || guardando} className="px-4 py-2 rounded-lg text-[13px] font-semibold bg-sidebar-bg text-white hover:brightness-110 disabled:opacity-60">
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Modal: editar (familiar ya vinculado) ---------- */

function ModalEditarFamiliar({
  vinculo,
  onCerrar,
  onGuardado,
}: {
  vinculo: EstudianteFamiliar;
  onCerrar: () => void;
  onGuardado: (actualizado: EstudianteFamiliar) => void;
}) {
  const [borrador, setBorrador] = useState<Familiar>({ ...vinculo.familiar });
  const [parentesco, setParentesco] = useState(vinculo.parentesco);
  const [esAcudiente, setEsAcudiente] = useState(vinculo.esAcudiente);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);

  function actualizarCampo(campo: keyof Familiar, valor: string) {
    setBorrador((prev) => ({ ...prev, [campo]: valor }));
  }

  async function guardar() {
    setGuardando(true);
    setErrorGuardado(null);
    try {
      const familiarActualizado = await actualizarFamiliar(borrador.idFamiliar!, borrador);
      const vinculoActualizado: EstudianteFamiliar = {
        ...vinculo,
        familiar: familiarActualizado,
        parentesco,
        esAcudiente,
      };
      const guardado = await actualizarVinculoFamiliar(vinculo.idEstudianteFamiliar!, vinculoActualizado);
      onGuardado(guardado);
    } catch (err) {
      if (err instanceof ApiError) {
        const msg = (err.body as { mensaje?: string })?.mensaje ?? "No se pudo guardar los cambios.";
        setErrorGuardado(msg);
      } else {
        setErrorGuardado("No se pudo conectar con el servidor.");
      }
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal titulo="Modificar familiar" onCerrar={onCerrar} ancho="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <CampoTexto label="Primer nombre *" valor={borrador.primerNombre} onChange={(v) => actualizarCampo("primerNombre", v)} />
          <CampoTexto label="Segundo nombre" valor={borrador.segundoNombre ?? ""} onChange={(v) => actualizarCampo("segundoNombre", v)} />
          <CampoTexto label="Primer apellido *" valor={borrador.primerApellido} onChange={(v) => actualizarCampo("primerApellido", v)} />
          <CampoTexto label="Segundo apellido" valor={borrador.segundoApellido ?? ""} onChange={(v) => actualizarCampo("segundoApellido", v)} />
          <CampoTexto label="Dirección" valor={borrador.direccion ?? ""} onChange={(v) => actualizarCampo("direccion", v)} />
          <CampoTexto label="Teléfono" valor={borrador.telefono ?? ""} onChange={(v) => actualizarCampo("telefono", v)} />
          <CampoTexto label="Ocupación" valor={borrador.ocupacion ?? ""} onChange={(v) => actualizarCampo("ocupacion", v)} />
          <CampoTexto label="Empresa" valor={borrador.empresa ?? ""} onChange={(v) => actualizarCampo("empresa", v)} />
          <CampoTexto label="Estado civil" valor={borrador.estadoCivil ?? ""} onChange={(v) => actualizarCampo("estadoCivil", v)} />
          <CampoSelect label="Parentesco *" valor={parentesco} opciones={PARENTESCOS} onChange={setParentesco} />
          <label className="flex items-center gap-2 text-[13px] text-text-main pb-2.5 col-span-2">
            <input type="checkbox" checked={esAcudiente} onChange={(e) => setEsAcudiente(e.target.checked)} />
            Es acudiente
          </label>
        </div>

        {errorGuardado && <p className="text-error text-[13px]">{errorGuardado}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onCerrar} disabled={guardando} className="px-4 py-2 rounded-lg text-[13px] font-semibold border border-border-subtle text-text-muted hover:bg-surface-container-low disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={guardar} disabled={guardando} className="px-4 py-2 rounded-lg text-[13px] font-semibold bg-sidebar-bg text-white hover:brightness-110 disabled:opacity-60">
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Modal: detalle (solo lectura) ---------- */

function ModalDetalleFamiliar({ vinculo, onCerrar }: { vinculo: EstudianteFamiliar; onCerrar: () => void }) {
  const f = vinculo.familiar;
  return (
    <Modal titulo="Detalle del familiar" onCerrar={onCerrar} ancho="lg">
      <div className="grid grid-cols-2 gap-4">
        <CampoLectura etiqueta="Nombre completo" valor={nombreCompletoFamiliar(f)} />
        <CampoLectura etiqueta="Documento" valor={`${f.tipoDocumento ?? "—"} ${f.numeroDocumento ?? ""}`} />
        <CampoLectura etiqueta="Dirección" valor={f.direccion} />
        <CampoLectura etiqueta="Teléfono" valor={f.telefono} />
        <CampoLectura etiqueta="Ocupación" valor={f.ocupacion} />
        <CampoLectura etiqueta="Empresa" valor={f.empresa} />
        <CampoLectura etiqueta="Estado civil" valor={f.estadoCivil} />
        <CampoLectura etiqueta="Parentesco" valor={vinculo.parentesco} />
        <CampoLectura etiqueta="Acudiente" valor={vinculo.esAcudiente ? "Sí" : "No"} />
      </div>
    </Modal>
  );
}

/* ---------- Subcomponentes de campo (locales a este archivo) ---------- */

function CampoLectura({ etiqueta, valor }: { etiqueta: string; valor?: string }) {
  return (
    <div>
      <p className="text-[12px] text-text-muted uppercase tracking-wide mb-1">{etiqueta}</p>
      <p className="text-[14px] text-text-main font-medium">{valor && valor.trim() !== "" ? valor : "—"}</p>
    </div>
  );
}

function CampoTexto({ label, valor, onChange }: { label: string; valor: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-text-main mb-1">{label}</label>
      <input
        type="text"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 border border-border-subtle rounded-lg text-[14px] focus:ring-2 focus:ring-sidebar-active outline-none"
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
        className="w-full px-3 py-2.5 border border-border-subtle rounded-lg text-[14px] bg-white focus:ring-2 focus:ring-sidebar-active outline-none"
      >
        {opciones.map((op) => (
          <option key={op.value} value={op.value}>{op.label}</option>
        ))}
      </select>
    </div>
  );
}