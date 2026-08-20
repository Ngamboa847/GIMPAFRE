package co.edu.unab.gimpafre.seguridad;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        Authentication autenticacion = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.nombreUsuario(), request.contrasena()));

        String token = jwtService.generarToken(autenticacion.getName());

        return ResponseEntity.ok(new LoginResponseDTO(token));
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioAutenticadoResponseDTO> usuarioActual(
            @AuthenticationPrincipal UsuarioAutenticado usuario) {

        var cuenta = usuario.getCuenta();

        // CuentaUsuario.docente / .estudiante son relaciones @ManyToOne
        // (no ids sueltos) — se extrae el id desde el objeto, si existe.
        Integer idDocente = cuenta.getDocente() != null ? cuenta.getDocente().getIdDocente() : null;
        Integer idEstudiante = cuenta.getEstudiante() != null ? cuenta.getEstudiante().getIdEstudiante() : null;

        UsuarioAutenticadoResponseDTO dto = new UsuarioAutenticadoResponseDTO(
                cuenta.getIdCuentaUsuario(),
                cuenta.getNombreUsuario(),
                cuenta.getRol().getCodigo(),
                cuenta.getRol().getDenominacion(),
                cuenta.getEstado(),
                idDocente,
                idEstudiante);

        return ResponseEntity.ok(dto);
    }
}
