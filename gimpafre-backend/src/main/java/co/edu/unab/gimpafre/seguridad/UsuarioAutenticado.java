package co.edu.unab.gimpafre.seguridad;

import co.edu.unab.gimpafre.configuracion.cuentausuario.CuentaEstado;
import co.edu.unab.gimpafre.configuracion.cuentausuario.CuentaUsuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class UsuarioAutenticado implements UserDetails {

    private final CuentaUsuario cuenta;

    public UsuarioAutenticado(CuentaUsuario cuenta) {
        this.cuenta = cuenta;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + cuenta.getRol().getCodigo()));
    }

    @Override
    public String getPassword() {
        return cuenta.getCredenciales();
    }

    @Override
    public String getUsername() {
        return cuenta.getNombreUsuario();
    }

    @Override
    public boolean isEnabled() {
        return cuenta.getEstado() == CuentaEstado.ACTIVO;
    }

    public CuentaUsuario getCuenta() {
        return cuenta;
    }
}