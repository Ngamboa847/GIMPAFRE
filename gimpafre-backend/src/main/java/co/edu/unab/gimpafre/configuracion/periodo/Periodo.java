package co.edu.unab.gimpafre.configuracion.periodo;

import java.math.BigDecimal;
import java.time.LocalDate;
import co.edu.unab.gimpafre.configuracion.anolectivo.AnoLectivo;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "Periodo")
@Getter
@Setter
public class Periodo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_periodo")
    private Integer idPeriodo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ano_lectivo", nullable = false)
    private AnoLectivo anoLectivo;

    @Column(name = "numero", nullable = false)
    private Integer numero;

    @Column(name = "denominacion", nullable = false, length = 40)
    private String denominacion;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Column(name = "porcentaje", precision = 4, scale = 1)
    private BigDecimal porcentaje;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}