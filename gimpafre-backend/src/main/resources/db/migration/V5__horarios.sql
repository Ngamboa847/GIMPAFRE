-- =====================================================================
-- V4 - Horarios
-- Plataforma de gestion academica GIMPAFRE
-- Generado a partir del Modelo de Datos oficial (PDF) + SRS RF-34 a RF-38
-- y Anexo N (CU-H01 a CU-H04). Sin ronda de diseño confirmada — revisar
-- los supuestos marcados antes de dar esta migracion por cerrada.
-- =====================================================================

-- Version de horario de un grupo. CU-H01: se construye, se valida y
-- queda marcada como version vigente; puede haber versiones anteriores
-- (historial, CU-H04).
CREATE TABLE Horario (
    id_horario            INT IDENTITY(1,1) PRIMARY KEY,
    id_grupo              INT NOT NULL,
    version                INT NOT NULL,
    fecha_vigencia_inicio  DATE NULL,
    fecha_vigencia_fin      DATE NULL,
    estado                   NVARCHAR(20) NOT NULL,  -- SUPUESTO: 'BORRADOR' | 'VIGENTE' | 'HISTORICO' (CU-H01/CU-H04), string libre
    CONSTRAINT fk_horario_grupo
        FOREIGN KEY (id_grupo) REFERENCES Grupo(id_grupo),
    CONSTRAINT uq_horario_grupo_version UNIQUE (id_grupo, version)
);

-- Bloque concreto de dia/hora para una asignacion docente (=
-- asignatura+grupo+docente) dentro de una version de horario.
CREATE TABLE BloqueHorario (
    id_bloque_horario      INT IDENTITY(1,1) PRIMARY KEY,
    id_horario              INT NOT NULL,
    id_asignacion_docente    INT NOT NULL,
    dia                        NVARCHAR(20) NOT NULL,  -- SUPUESTO: 'LUNES'..'VIERNES', string libre
    hora_inicio                  TIME NOT NULL,
    hora_fin                      TIME NOT NULL,
    CONSTRAINT fk_bloque_horario
        FOREIGN KEY (id_horario) REFERENCES Horario(id_horario),
    CONSTRAINT fk_bloque_asigdoc
        FOREIGN KEY (id_asignacion_docente) REFERENCES AsignacionDocente(id_asignacion_docente)
);
-- NOTA: la deteccion de choques (RF-35: mismo docente en dos grupos al
-- mismo tiempo) es una regla de solapamiento entre filas — no se puede
-- expresar como UNIQUE/CHECK simple en SQL Server; queda para logica de
-- servicio, igual que la suma de porcentajes en ComponenteEvaluacion.
