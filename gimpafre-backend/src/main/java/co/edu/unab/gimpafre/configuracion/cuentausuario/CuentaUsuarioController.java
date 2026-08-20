package co.edu.unab.gimpafre.configuracion.cuentausuario;

import java.util.List;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cuentas-usuario")
public class CuentaUsuarioController {

    private final CuentaUsuarioService cuentaUsuarioService;

    public CuentaUsuarioController(CuentaUsuarioService cuentaUsuarioService) {
        this.cuentaUsuarioService = cuentaUsuarioService;
    }

    @GetMapping
    public List<CuentaUsuarioResponseDTO> listar() {
        return cuentaUsuarioService.listar();
    }

    @GetMapping("/{id}")
    public CuentaUsuarioResponseDTO obtener(@PathVariable Integer id) {
        return cuentaUsuarioService.obtenerPorId(id);
    }

    @PostMapping
    public ResponseEntity<CuentaUsuarioResponseDTO> crear(
            @Valid @RequestBody CuentaUsuarioRequestDTO request) {
        CuentaUsuarioResponseDTO creada = cuentaUsuarioService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    @PutMapping("/{id}")
    public CuentaUsuarioResponseDTO actualizar(@PathVariable Integer id,
                                               @Valid @RequestBody CuentaUsuarioEstadoDTO request) {
        return cuentaUsuarioService.actualizar(id, request.getEstado());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        cuentaUsuarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}