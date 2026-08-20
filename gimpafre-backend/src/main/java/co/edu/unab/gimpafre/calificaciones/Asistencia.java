package co.edu.unab.gimpafre.calificaciones;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "Asistencia")
@Getter
@Setter
@NoArgsConstructor
public class Asistencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_asistencia")
    private Integer idAsistencia;

    // Shortcut: id_matricula / id_asignacion_docente crudos (sin @ManyToOne)
    @Column(name = "id_matricula", nullable = false)
    private Integer idMatricula;

    @Column(name = "id_asignacion_docente", nullable = false)
    private Integer idAsignacionDocente;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado;

    @Column(name = "motivo", length = 255)
    private String motivo;

    @Column(name = "soporte_justificacion", length = 255)
    private String soporteJustificacion;
}
