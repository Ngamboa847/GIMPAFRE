-- =====================================================================
-- V1 - Esquema base del MVP: configuracion institucional + matricula
-- Plataforma de gestion academica GIMPAFRE
-- =====================================================================

-- ---------------------------------------------------------------------
-- BLOQUE A - Catalogos y base independiente
-- ---------------------------------------------------------------------

CREATE TABLE Rol (
    id_rol        INT IDENTITY(1,1) PRIMARY KEY,
    codigo        NVARCHAR(30)  NOT NULL UNIQUE,
    denominacion  NVARCHAR(80)  NOT NULL
);

CREATE TABLE TipoDocumento (
    id_tipo_documento INT IDENTITY(1,1) PRIMARY KEY,
    nombre            NVARCHAR(120) NOT NULL,
    obligatorio       BIT NOT NULL DEFAULT 0,
    activo            BIT NOT NULL DEFAULT 1
);

CREATE TABLE Grado (
    id_grado  INT IDENTITY(1,1) PRIMARY KEY,
    codigo    NVARCHAR(20) NOT NULL UNIQUE,
    nombre    NVARCHAR(60) NOT NULL,
    nivel     NVARCHAR(40) NOT NULL
);

-- ---------------------------------------------------------------------
-- BLOQUE B - Estructura temporal y organizativa
-- ---------------------------------------------------------------------

CREATE TABLE AnoLectivo (
    id_ano_lectivo INT IDENTITY(1,1) PRIMARY KEY,
    denominacion   NVARCHAR(20) NOT NULL UNIQUE,
    fecha_inicio   DATE NOT NULL,
    fecha_fin      DATE NOT NULL,
    estado         NVARCHAR(20) NOT NULL
);

CREATE TABLE Periodo (
    id_periodo     INT IDENTITY(1,1) PRIMARY KEY,
    id_ano_lectivo INT NOT NULL,
    numero         INT NOT NULL,
    denominacion   NVARCHAR(40) NOT NULL,
    fecha_inicio   DATE NOT NULL,
    fecha_fin      DATE NOT NULL,
    porcentaje     DECIMAL(4,1) NULL,
    estado         NVARCHAR(20) NOT NULL,
    CONSTRAINT fk_periodo_ano_lectivo
        FOREIGN KEY (id_ano_lectivo) REFERENCES AnoLectivo(id_ano_lectivo),
    CONSTRAINT uq_periodo_ano_numero UNIQUE (id_ano_lectivo, numero)
);

CREATE TABLE Grupo (
    id_grupo       INT IDENTITY(1,1) PRIMARY KEY,
    id_grado       INT NOT NULL,
    id_ano_lectivo INT NOT NULL,
    denominacion   NVARCHAR(20) NOT NULL,
    cupo_maximo    INT NULL,
    CONSTRAINT fk_grupo_grado
        FOREIGN KEY (id_grado) REFERENCES Grado(id_grado),
    CONSTRAINT fk_grupo_ano_lectivo
        FOREIGN KEY (id_ano_lectivo) REFERENCES AnoLectivo(id_ano_lectivo),
    CONSTRAINT uq_grupo_grado_ano_denom UNIQUE (id_grado, id_ano_lectivo, denominacion)
);

-- ---------------------------------------------------------------------
-- BLOQUE C - Personas
-- ---------------------------------------------------------------------

CREATE TABLE Estudiante (
    id_estudiante        INT IDENTITY(1,1) PRIMARY KEY,
    tipo_documento       NVARCHAR(20)  NOT NULL,
    numero_documento     NVARCHAR(30)  NOT NULL UNIQUE,
    lugar_expedicion_doc NVARCHAR(80)  NULL,
    primer_nombre        NVARCHAR(60)  NOT NULL,
    segundo_nombre       NVARCHAR(60)  NULL,
    primer_apellido      NVARCHAR(60)  NOT NULL,
    segundo_apellido     NVARCHAR(60)  NULL,
    sexo                 NVARCHAR(20)  NULL,
    fecha_nacimiento     DATE          NULL,
    lugar_nacimiento     NVARCHAR(80)  NULL,
    nacionalidad         NVARCHAR(50)  NULL,
    direccion            NVARCHAR(150) NULL,
    barrio               NVARCHAR(80)  NULL,
    telefono             NVARCHAR(30)  NULL,
    movil                NVARCHAR(30)  NULL,
    fotografia           NVARCHAR(255) NULL,
    sisben               NVARCHAR(30)  NULL,
    estrato              INT           NULL,
    grupo_sanguineo      NVARCHAR(10)  NULL,
    talla                DECIMAL(4,2)  NULL,
    peso                 DECIMAL(5,2)  NULL,
    info_seguridad_social NVARCHAR(120) NULL,
    numero_afiliacion    NVARCHAR(50)  NULL,
    diagnostico_clinico  NVARCHAR(MAX) NULL,
    pertenencia_etnica   NVARCHAR(80)  NULL,
    area_interes         NVARCHAR(120) NULL,
    area_dificultad      NVARCHAR(120) NULL,
    numero_hermanos      INT           NULL,
    hermanos_mujeres     INT           NULL,
    hermanos_hombres     INT           NULL,
    lugar_entre_hermanos INT           NULL,
    con_quien_vive       NVARCHAR(120) NULL,
    observaciones        NVARCHAR(MAX) NULL
);

CREATE TABLE Familiar (
    id_familiar      INT IDENTITY(1,1) PRIMARY KEY,
    tipo_documento   NVARCHAR(20)  NULL,
    numero_documento NVARCHAR(30)  NULL,
    primer_nombre    NVARCHAR(60)  NOT NULL,
    segundo_nombre   NVARCHAR(60)  NULL,
    primer_apellido  NVARCHAR(60)  NOT NULL,
    segundo_apellido NVARCHAR(60)  NULL,
    direccion        NVARCHAR(150) NULL,
    telefono         NVARCHAR(30)  NULL,
    ocupacion        NVARCHAR(80)  NULL,
    empresa          NVARCHAR(120) NULL,
    estado_civil     NVARCHAR(40)  NULL
);

CREATE TABLE Docente (
    id_docente          INT IDENTITY(1,1) PRIMARY KEY,
    tipo_documento      NVARCHAR(20)  NOT NULL,
    numero_documento    NVARCHAR(30)  NOT NULL UNIQUE,
    primer_nombre       NVARCHAR(60)  NOT NULL,
    segundo_nombre      NVARCHAR(60)  NULL,
    primer_apellido     NVARCHAR(60)  NOT NULL,
    segundo_apellido    NVARCHAR(60)  NULL,
    telefono            NVARCHAR(30)  NULL,
    correo              NVARCHAR(120) NULL,
    formacion_academica NVARCHAR(MAX) NULL,
    estado              NVARCHAR(20)  NOT NULL
);

CREATE TABLE EstudianteFamiliar (
    id_estudiante_familiar INT IDENTITY(1,1) PRIMARY KEY,
    id_estudiante          INT NOT NULL,
    id_familiar            INT NOT NULL,
    parentesco             NVARCHAR(40) NOT NULL,
    es_acudiente           BIT NOT NULL DEFAULT 0,
    CONSTRAINT fk_estfam_estudiante
        FOREIGN KEY (id_estudiante) REFERENCES Estudiante(id_estudiante),
    CONSTRAINT fk_estfam_familiar
        FOREIGN KEY (id_familiar) REFERENCES Familiar(id_familiar),
    CONSTRAINT uq_estfam_estudiante_familiar UNIQUE (id_estudiante, id_familiar)
);

-- ---------------------------------------------------------------------
-- BLOQUE D - Matricula y anexos
-- ---------------------------------------------------------------------

CREATE TABLE Matricula (
    id_matricula             INT IDENTITY(1,1) PRIMARY KEY,
    id_estudiante            INT NOT NULL,
    id_ano_lectivo           INT NOT NULL,
    id_grado                 INT NOT NULL,
    id_grupo                 INT NULL,
    consecutivo              NVARCHAR(40) NOT NULL UNIQUE,
    fecha                    DATE NOT NULL,
    tipo                     NVARCHAR(40) NULL,
    estado                   NVARCHAR(20) NOT NULL,
    concepto_psicopedagogico NVARCHAR(MAX) NULL,
    resultado_registro_simat NVARCHAR(40) NULL,
    CONSTRAINT fk_matricula_estudiante
        FOREIGN KEY (id_estudiante) REFERENCES Estudiante(id_estudiante),
    CONSTRAINT fk_matricula_ano_lectivo
        FOREIGN KEY (id_ano_lectivo) REFERENCES AnoLectivo(id_ano_lectivo),
    CONSTRAINT fk_matricula_grado
        FOREIGN KEY (id_grado) REFERENCES Grado(id_grado),
    CONSTRAINT fk_matricula_grupo
        FOREIGN KEY (id_grupo) REFERENCES Grupo(id_grupo),
    CONSTRAINT uq_matricula_estudiante_ano UNIQUE (id_estudiante, id_ano_lectivo)
);

CREATE TABLE DocumentoAnexo (
    id_documento_anexo INT IDENTITY(1,1) PRIMARY KEY,
    id_matricula       INT NOT NULL,
    id_tipo_documento  INT NOT NULL,
    estado             NVARCHAR(20) NOT NULL,
    fecha_entrega      DATE NULL,
    referencia_archivo NVARCHAR(255) NULL,
    CONSTRAINT fk_docanexo_matricula
        FOREIGN KEY (id_matricula) REFERENCES Matricula(id_matricula),
    CONSTRAINT fk_docanexo_tipo
        FOREIGN KEY (id_tipo_documento) REFERENCES TipoDocumento(id_tipo_documento)
);

-- ---------------------------------------------------------------------
-- BLOQUE E - Cuentas de usuario
-- ---------------------------------------------------------------------

CREATE TABLE CuentaUsuario (
    id_cuenta_usuario INT IDENTITY(1,1) PRIMARY KEY,
    id_rol            INT NOT NULL,
    id_docente        INT NULL,
    id_estudiante     INT NULL,
    nombre_usuario    NVARCHAR(60)  NOT NULL UNIQUE,
    credenciales      NVARCHAR(255) NOT NULL,
    estado            NVARCHAR(20)  NOT NULL,
    fecha_creacion    DATE NOT NULL,
    CONSTRAINT fk_cuenta_rol
        FOREIGN KEY (id_rol) REFERENCES Rol(id_rol),
    CONSTRAINT fk_cuenta_docente
        FOREIGN KEY (id_docente) REFERENCES Docente(id_docente),
    CONSTRAINT fk_cuenta_estudiante
        FOREIGN KEY (id_estudiante) REFERENCES Estudiante(id_estudiante)
);