package co.edu.unab.gimpafre.configuracion.cuentausuario;

public final class CuentaUsuarioMapper {

    private CuentaUsuarioMapper() {
    }

    public static CuentaUsuarioResponseDTO aResponseDTO(CuentaUsuario cuenta) {
        CuentaUsuarioResponseDTO dto = new CuentaUsuarioResponseDTO();
        dto.setIdCuentaUsuario(cuenta.getIdCuentaUsuario());
        dto.setNombreUsuario(cuenta.getNombreUsuario());
        dto.setEstado(cuenta.getEstado());
        dto.setFechaCreacion(cuenta.getFechaCreacion());

        if (cuenta.getRol() != null) {
            dto.setIdRol(cuenta.getRol().getIdRol());
            dto.setRolDenominacion(cuenta.getRol().getDenominacion());
        }
        if (cuenta.getDocente() != null) {
            dto.setIdDocente(cuenta.getDocente().getIdDocente());
        }
        if (cuenta.getEstudiante() != null) {
            dto.setIdEstudiante(cuenta.getEstudiante().getIdEstudiante());
        }
        return dto;
    }
}