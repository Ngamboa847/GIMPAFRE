package co.edu.unab.gimpafre.configuracion.cuentausuario;

import java.time.LocalDate;
import co.edu.unab.gimpafre.configuracion.rol.Rol;
import co.edu.unab.gimpafre.personas.docente.Docente;
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
@Table(name = "CuentaUsuario")
@Getter
@Setter
public class CuentaUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cuenta_usuario")
    private Integer idCuentaUsuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_rol", nullable = false)
    private Rol rol;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_docente")
    private Docente docente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estudiante")
    private Estudiante estudiante;

    @Column(name = "nombre_usuario", nullable = false, length = 60, unique = true)
    private String nombreUsuario;

    @Column(name = "credenciales", nullable = false, length = 255)
    private String credenciales;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private CuentaEstado estado;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDate fechaCreacion;

}