package co.edu.unab.gimpafre.certificados;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "DocumentoExpedido")
@Getter
@Setter
@NoArgsConstructor
public class DocumentoExpedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_documento_expedido")
    private Integer idDocumentoExpedido;

    // Shortcut: id_estudiante / id_cuenta_usuario crudos (sin @ManyToOne)
    @Column(name = "id_estudiante", nullable = false)
    private Integer idEstudiante;

    @Column(name = "id_cuenta_usuario", nullable = false)
    private Integer idCuentaUsuario;

    @Column(name = "tipo", nullable = false, length = 60)
    private String tipo;

    @Column(name = "fecha_solicitud", nullable = false)
    private LocalDate fechaSolicitud;

    @Column(name = "fecha_expedicion")
    private LocalDate fechaExpedicion;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado;
}
