import { useEffect, useState } from "react";
import { listarDocumentosExpedidos } from "./api";
import type { DocumentoExpedido } from "./types";

// Vista de consulta directa (shortcut) — muestra DocumentoExpedido tal
// cual llega del backend. Fuera de alcance del MVP de código (Anexo P §1.8).

export function CertificadosListPage() {
  const [datos, setDatos] = useState<DocumentoExpedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listarDocumentosExpedidos()
      .then(setDatos)
      .catch(() => setError("No se pudo cargar los documentos expedidos."))
      .finally(() => setCargando(false));
  }, []);

  return (
    <>
      <div className="mb-stack-lg">
        <h2 className="font-headline text-[32px] font-bold text-text-main">
          Certificados
        </h2>
        <p className="font-body text-[16px] text-text-muted">
          Consulta de documentos expedidos — vista preliminar
        </p>
      </div>

      {error && (
        <div className="mb-stack-lg text-[14px] text-error bg-error/10 border border-error/20 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border border-border-subtle overflow-hidden">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-surface-container-low text-text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">ID Estudiante</th>
              <th className="px-4 py-3 font-semibold">Tipo</th>
              <th className="px-4 py-3 font-semibold">Fecha solicitud</th>
              <th className="px-4 py-3 font-semibold">Fecha expedición</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                  Cargando…
                </td>
              </tr>
            )}
            {!cargando && datos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                  No hay documentos expedidos todavía.
                </td>
              </tr>
            )}
            {datos.map((d) => (
              <tr key={d.idDocumentoExpedido} className="border-t border-border-subtle">
                <td className="px-4 py-3">{d.idEstudiante}</td>
                <td className="px-4 py-3">{d.tipo}</td>
                <td className="px-4 py-3">{d.fechaSolicitud}</td>
                <td className="px-4 py-3">{d.fechaExpedicion ?? "—"}</td>
                <td className="px-4 py-3">{d.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
