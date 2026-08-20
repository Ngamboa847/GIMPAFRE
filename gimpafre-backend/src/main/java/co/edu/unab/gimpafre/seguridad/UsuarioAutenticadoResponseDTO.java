package co.edu.unab.gimpafre.seguridad;

import co.edu.unab.gimpafre.configuracion.cuentausuario.CuentaEstado;

public record UsuarioAutenticadoResponseDTO(
        Integer idCuentaUsuario,
        String nombreUsuario,
        String rol,
        String rolDenominacion,
        CuentaEstado estado,
        Integer idDocente,
        Integer idEstudiante
) {}
