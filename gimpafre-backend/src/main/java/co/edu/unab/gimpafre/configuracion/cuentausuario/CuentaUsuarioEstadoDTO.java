package co.edu.unab.gimpafre.configuracion.cuentausuario;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CuentaUsuarioEstadoDTO {

    @NotNull(message = "El estado es obligatorio")
    private CuentaEstado estado;
}