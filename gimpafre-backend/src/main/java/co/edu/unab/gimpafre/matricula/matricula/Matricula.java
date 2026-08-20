package co.edu.unab.gimpafre.matricula.matricula;

import java.time.LocalDate;
import co.edu.unab.gimpafre.configuracion.anolectivo.AnoLectivo;
import co.edu.unab.gimpafre.configuracion.grado.Grado;
import co.edu.unab.gimpafre.configuracion.grupo.Grupo;
import co.edu.unab.gimpafre.personas.estudiante.Estudiante;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;


@Entity
@Table(name = "Matricula")
@Getter
@Setter

public class Matricula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_matricula")
    private Integer idMatricula;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estudiante", nullable = false)
    private Estudiante estudiante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ano_lectivo", nullable = false)
    private AnoLectivo anoLectivo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_grado", nullable = false)
    private Grado grado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_grupo")
    private Grupo grupo;

    @Column(name = "consecutivo", nullable = false, length = 40, unique = true)
    private String consecutivo;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "tipo", length = 40)
    private String tipo;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private MatriculaEstado estado;

    @Column(name = "concepto_psicopedagogico", columnDefinition = "NVARCHAR(MAX)")
    private String conceptoPsicopedagogico;

    @Enumerated(EnumType.STRING)
    @Column(name = "resultado_registro_simat", length = 20)
    private RegistroSimat resultadoRegistroSimat;

    
}