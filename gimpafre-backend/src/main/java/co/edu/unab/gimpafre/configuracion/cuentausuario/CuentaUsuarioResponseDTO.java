package co.edu.unab.gimpafre.configuracion.cuentausuario;

import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CuentaUsuarioResponseDTO {

    private Integer idCuentaUsuario;
    private String nombreUsuario;
    private CuentaEstado estado;
    private LocalDate fechaCreacion;

    private Integer idRol;
    private String rolDenominacion;

    private Integer idDocente;
    private Integer idEstudiante;
}