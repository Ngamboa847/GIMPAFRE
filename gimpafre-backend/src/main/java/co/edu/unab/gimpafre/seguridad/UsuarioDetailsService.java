package co.edu.unab.gimpafre.seguridad;

import co.edu.unab.gimpafre.configuracion.cuentausuario.CuentaUsuario;
import co.edu.unab.gimpafre.configuracion.cuentausuario.CuentaUsuarioRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UsuarioDetailsService implements UserDetailsService {

    private final CuentaUsuarioRepository cuentaUsuarioRepository;

    public UsuarioDetailsService(CuentaUsuarioRepository cuentaUsuarioRepository) {
        this.cuentaUsuarioRepository = cuentaUsuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        CuentaUsuario cuenta = cuentaUsuarioRepository
                .buscarPorNombreUsuarioConRol(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "No existe una cuenta con el nombre de usuario " + username));

        return new UsuarioAutenticado(cuenta);
    }
}