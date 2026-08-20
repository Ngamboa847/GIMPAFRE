import { useEffect, useState } from "react";
import { Modal } from "../../shared/components/ui/Modal";
import { ApiError } from "../../shared/api/client";
import { listarTiposDocumentoActivos } from "../configuracion/tipos-documento/api";
import type { TipoDocumento } from "../configuracion/tipos-documento/types";
import {
  listarDocumentosAnexosPorMatricula,
  crearDocumentoAnexo,
  actualizarDocumentoAnexo,
  eliminarDocumentoAnexo,
} from "./api";
import type { DocumentoAnexo } from "./types";

interface Props {
  idMatricula: number;
}

interface FilaDocumento {
  tipoDocumento: TipoDocumento;
  documento: DocumentoAnexo | null;
}

// "Pendiente" se infiere: se listan todos los TipoDocumento activos y se
// cruzan contra los DocumentoAnexo ya creados para esta matrícula. Solo se
// crea una fila en el backend cuando el usuario registra la entrega — no hay
// filas "pendiente" precreadas.
export function DocumentosAnexosSection({ idMatricula }: Props) {
  const [tipos, setTipos] = useState<TipoDocumento[]>([]);
  const [documentos, setDocumentos] = useState<DocumentoAnexo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal de registrar/editar entrega
  const [modalTipo, setModalTipo] = useState<TipoDocumento | null>(null);
  const [modalDocumento, setModalDocumento] = useState<DocumentoAnexo | null>(null);
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [referenciaArchivo, setReferenciaArchivo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  // Confirmación de "quitar" (vuelve el documento a pendiente)
  const [confirmandoEliminar, setConfirmandoEliminar] = useState<DocumentoAnexo | null>(null);
  const [eliminando, setEliminando] = useState<number | null>(null);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        const [tiposData, documentosData] = await Promise.all([
          listarTiposDocumentoActivos(),
          listarDocumentosAnexosPorMatricula(idMatricula),
        ]);
        if (activo) {
          setTipos(tiposData);
          setDocumentos(documentosData);
          setCargando(false);
        }
      } catch {
        if (activo) {
          setError("No se pudieron cargar los documentos anexos.");
          setCargando(false);
        }
      }
    }
    cargar();
    return () => {
      activo = false;
    };
  }, [idMatricula]);

  const filas: FilaDocumento[] = tipos.map((tipo) => ({
    tipoDocumento: tipo,
    documento: documentos.find((d) => d.tipoDocumento.idTipoDocumento === tipo.idTipoDocumento) ?? null,
  }));

  function abrirRegistro(tipo: TipoDocumento) {
    setModalTipo(tipo);
    setModalDocumento(null);
    setFechaEntrega(new Date().toISOString().slice(0, 10));
    setReferenciaArchivo("");
    setErrorModal(null);
  }

  function abrirEdicion(tipo: TipoDocumento, documento: DocumentoAnexo) {
    setModalTipo(tipo);
    setModalDocumento(documento);
    setFechaEntrega(documento.fechaEntrega ?? "");
    setReferenciaArchivo(documento.referenciaArchivo ?? "");
    setErrorModal(null);
  }

  function cerrarModal() {
    setModalTipo(null);
    setModalDocumento(null);
  }

  async function guardar() {
    if (!modalTipo) return;
    setGuardando(true);
    setErrorModal(null);
    try {
      if (modalDocumento) {
        const actualizado = await actualizarDocumentoAnexo(modalDocumento.idDocumentoAnexo, {
          estado: "ENTREGADO",
          fechaEntrega: fechaEntrega || undefined,
          referenciaArchivo: referenciaArchivo || undefined,
        });
        setDocumentos((prev) =>
          prev.map((d) => (d.idDocumentoAnexo === actualizado.idDocumentoAnexo ? actualizado : d))
        );
      } else {
        const creado = await crearDocumentoAnexo(
          {
            estado: "ENTREGADO",
            fechaEntrega: fechaEntrega || undefined,
            referenciaArchivo: referenciaArchivo || undefined,
          },
          { idMatricula, idTipoDocumento: modalTipo.idTipoDocumento }
        );
        setDocumentos((prev) => [...prev, creado]);
      }
      cerrarModal();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorModal((err.body as { mensaje?: string })?.mensaje ?? "No se pudo guardar el documento.");
      } else {
        setErrorModal("No se pudo conectar con el servidor.");
      }
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(documento: DocumentoAnexo) {
    setEliminando(documento.idDocumentoAnexo);
    try {
      await eliminarDocumentoAnexo(documento.idDocumentoAnexo);
      setDocumentos((prev) => prev.filter((d) => d.idDocumentoAnexo !== documento.idDocumentoAnexo));
      setConfirmandoEliminar(null);
    } catch {
      setError("No se pudo quitar el documento. Intenta de nuevo.");
    } finally {
      setEliminando(null);
    }
  }

  return (
    <div className="bg-white rounded-lg border border-border-subtle p-stack-lg mb-stack-md">
      <div className="flex items-center gap-2 mb-6 pb-3 border-b border-border-subtle">
        <span className="material-symbols-outlined text-sidebar-bg">folder_open</span>
        <h3 className="font-headline text-[18px] font-semibold text-on-primary-fixed">Documentos anexos</h3>
      </div>

      {cargando ? (
        <p className="text-[13px] text-text-muted">Cargando documentos...</p>
      ) : error ? (
        <p className="text-[13px] text-error">{error}</p>
      ) : filas.length === 0 ? (
        <p className="text-[13px] text-text-muted">No hay tipos de documento activos configurados.</p>
      ) : (
        <div className="divide-y divide-border-subtle">
          {filas.map(({ tipoDocumento, documento }) => (
            <div key={tipoDocumento.idTipoDocumento} className="flex items-center justify-between py-3 gap-4">
              <div className="min-w-0">
                <p className="text-[14px] text-text-main font-medium truncate">
                  {tipoDocumento.nombre}
                  {tipoDocumento.obligatorio && <span className="text-error"> *</span>}
                </p>
                {documento ? (
                  <p className="text-[12px] text-text-muted">
                    {documento.fechaEntrega ? `Entregado el ${documento.fechaEntrega}` : "Entregado"}
                    {documento.referenciaArchivo ? ` · ${documento.referenciaArchivo}` : ""}
                  </p>
                ) : (
                  <p className="text-[12px] text-text-muted">Pendiente</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {documento ? (
                  <>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-status-success/10 text-status-success">
                      Entregado
                    </span>
                    <button
                      onClick={() => abrirEdicion(tipoDocumento, documento)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-surface-container-low transition-colors"
                      title="Editar"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => setConfirmandoEliminar(documento)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-surface-container-low transition-colors"
                      title="Quitar (vuelve a pendiente)"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </>
                ) : (
                  <>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-status-warning/10 text-status-warning">
                      Pendiente
                    </span>
                    <button
                      onClick={() => abrirRegistro(tipoDocumento)}
                      className="flex items-center gap-1 text-[13px] font-medium text-sidebar-bg hover:underline"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                      Registrar entrega
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal registrar/editar entrega */}
      {modalTipo && (
        <Modal
          titulo={modalDocumento ? `Editar entrega — ${modalTipo.nombre}` : `Registrar entrega — ${modalTipo.nombre}`}
          onCerrar={cerrarModal}
        >
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-text-main mb-1">Fecha de entrega</label>
              <input
                type="date"
                value={fechaEntrega}
                onChange={(e) => setFechaEntrega(e.target.value)}
                className="w-full px-3 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] focus:ring-2 focus:ring-sidebar-active outline-none"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-text-main mb-1">Referencia / archivo</label>
              <input
                type="text"
                value={referenciaArchivo}
                onChange={(e) => setReferenciaArchivo(e.target.value)}
                placeholder="Ej. nombre del archivo o folio físico"
                className="w-full px-3 py-2.5 border border-border-subtle rounded-lg font-body text-[14px] focus:ring-2 focus:ring-sidebar-active outline-none"
              />
            </div>
            {errorModal && <p className="text-[12px] text-error">{errorModal}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={cerrarModal}
                disabled={guardando}
                className="px-4 py-2 rounded-lg text-[14px] font-medium text-text-muted hover:bg-surface-container-low disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={guardando}
                className="px-4 py-2 rounded-lg text-[14px] font-semibold bg-sidebar-bg text-white hover:brightness-110 disabled:opacity-60"
              >
                {guardando ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmación de "quitar" */}
      {confirmandoEliminar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="font-headline text-[18px] font-semibold text-text-main mb-3">Quitar documento</h3>
            <p className="text-[14px] text-text-muted mb-4">
              ¿Confirma quitar el registro de entrega de "{confirmandoEliminar.tipoDocumento.nombre}"? Volverá a quedar como pendiente.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmandoEliminar(null)}
                disabled={eliminando !== null}
                className="px-4 py-2 rounded-lg text-[14px] font-medium text-text-muted hover:bg-surface-container-low disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => eliminar(confirmandoEliminar)}
                disabled={eliminando !== null}
                className="px-4 py-2 rounded-lg text-[14px] font-semibold bg-error text-white hover:brightness-110 disabled:opacity-60"
              >
                {eliminando !== null ? "Quitando..." : "Quitar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
