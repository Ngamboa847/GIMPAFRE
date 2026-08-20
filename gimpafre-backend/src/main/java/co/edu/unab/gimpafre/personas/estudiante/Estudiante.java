package co.edu.unab.gimpafre.personas.estudiante;

import java.math.BigDecimal;
import java.time.LocalDate;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "Estudiante")
@Getter
@Setter
public class Estudiante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_estudiante")
    private Integer idEstudiante;

    @Column(name = "tipo_documento", nullable = false, length = 20)
    private String tipoDocumento;

    @Column(name = "numero_documento", nullable = false, length = 30, unique = true)
    private String numeroDocumento;

    @Column(name = "lugar_expedicion_doc", length = 80)
    private String lugarExpedicionDoc;

    @Column(name = "primer_nombre", nullable = false, length = 60)
    private String primerNombre;

    @Column(name = "segundo_nombre", length = 60)
    private String segundoNombre;

    @Column(name = "primer_apellido", nullable = false, length = 60)
    private String primerApellido;

    @Column(name = "segundo_apellido", length = 60)
    private String segundoApellido;

    @Column(name = "sexo", length = 20)
    private String sexo;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Column(name = "lugar_nacimiento", length = 80)
    private String lugarNacimiento;

    @Column(name = "nacionalidad", length = 50)
    private String nacionalidad;

    @Column(name = "direccion", length = 150)
    private String direccion;

    @Column(name = "barrio", length = 80)
    private String barrio;

    @Column(name = "telefono", length = 30)
    private String telefono;

    @Column(name = "movil", length = 30)
    private String movil;

    @Column(name = "fotografia", length = 255)
    private String fotografia;

    @Column(name = "sisben", length = 30)
    private String sisben;

    @Column(name = "estrato")
    private Integer estrato;

    @Column(name = "grupo_sanguineo", length = 10)
    private String grupoSanguineo;

    @Column(name = "talla", precision = 4, scale = 2)
    private BigDecimal talla;

    @Column(name = "peso", precision = 5, scale = 2)
    private BigDecimal peso;

    @Column(name = "info_seguridad_social", length = 120)
    private String infoSeguridadSocial;

    @Column(name = "numero_afiliacion", length = 50)
    private String numeroAfiliacion;

    @Column(name = "diagnostico_clinico", columnDefinition = "NVARCHAR(MAX)")
    private String diagnosticoClinico;

    @Column(name = "pertenencia_etnica", length = 80)
    private String pertenenciaEtnica;

    @Column(name = "area_interes", length = 120)
    private String areaInteres;

    @Column(name = "area_dificultad", length = 120)
    private String areaDificultad;

    @Column(name = "numero_hermanos")
    private Integer numeroHermanos;

    @Column(name = "hermanos_mujeres")
    private Integer hermanosMujeres;

    @Column(name = "hermanos_hombres")
    private Integer hermanosHombres;

    @Column(name = "lugar_entre_hermanos")
    private Integer lugarEntreHermanos;

    @Column(name = "con_quien_vive", length = 120)
    private String conQuienVive;

    @Column(name = "observaciones", columnDefinition = "NVARCHAR(MAX)")
    private String observaciones;
}