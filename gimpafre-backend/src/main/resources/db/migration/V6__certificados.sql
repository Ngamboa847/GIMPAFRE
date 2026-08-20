-- =====================================================================
-- V5 - Certificados
-- Plataforma de gestion academica GIMPAFRE
-- Generado a partir del Modelo de Datos oficial (PDF). Sin ronda de
-- diseño confirmada — revisar los supuestos marcados antes de dar esta
-- migracion por cerrada.
-- =====================================================================

-- Documento expedido a un estudiante (constancia, certificado, etc.).
-- id_cuenta_usuario referencia quien gestiona la solicitud/expedicion
-- (tipicamente Encargado de Sistemas, segun la matriz de permisos —
-- "Expedicion de certificados": Rectora L, Enc. Sistemas C).
CREATE TABLE DocumentoExpedido (
    id_documento_expedido INT IDENTITY(1,1) PRIMARY KEY,
    id_estudiante          INT NOT NULL,
    id_cuenta_usuario       INT NOT NULL,
    tipo                      NVARCHAR(60) NOT NULL,   -- SUPUESTO: string libre (ej. 'CONSTANCIA_ESTUDIO', 'CERTIFICADO_NOTAS'), sin catalogo aparte
    fecha_solicitud             DATE NOT NULL,
    fecha_expedicion             DATE NULL,             -- NULL mientras esta en tramite
    estado                         NVARCHAR(20) NOT NULL, -- string libre, mismo patron que Docente.estado
    CONSTRAINT fk_docexp_estudiante
        FOREIGN KEY (id_estudiante) REFERENCES Estudiante(id_estudiante),
    CONSTRAINT fk_docexp_cuenta
        FOREIGN KEY (id_cuenta_usuario) REFERENCES CuentaUsuario(id_cuenta_usuario)
);
