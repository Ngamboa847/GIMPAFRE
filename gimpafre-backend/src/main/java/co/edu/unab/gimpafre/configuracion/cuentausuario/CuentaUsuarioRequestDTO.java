package co.edu.unab.gimpafre.configuracion.cuentausuario;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CuentaUsuarioRequestDTO {

    @NotBlank(message = "El nombre de usuario es obligatorio")
    @Size(max = 60, message = "El nombre de usuario no puede exceder 60 caracteres")
    private String nombreUsuario;

    @NotBlank(message = "Las credenciales son obligatorias")
    private String credenciales;

    @NotNull(message = "El rol es obligatorio")
    private Integer idRol;

    private Integer idDocente;

    private Integer idEstudiante;
}