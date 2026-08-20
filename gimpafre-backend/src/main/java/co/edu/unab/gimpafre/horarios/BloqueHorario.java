package co.edu.unab.gimpafre.horarios;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;

@Entity
@Table(name = "BloqueHorario")
@Getter
@Setter
@NoArgsConstructor
public class BloqueHorario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_bloque_horario")
    private Integer idBloqueHorario;

    @Column(name = "id_horario", nullable = false)
    private Integer idHorario;

    // Shortcut: id_asignacion_docente crudo (sin @ManyToOne)
    @Column(name = "id_asignacion_docente", nullable = false)
    private Integer idAsignacionDocente;

    @Column(name = "dia", nullable = false, length = 20)
    private String dia;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;
}
