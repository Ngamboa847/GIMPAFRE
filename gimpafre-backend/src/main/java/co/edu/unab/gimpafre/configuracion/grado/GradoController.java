package co.edu.unab.gimpafre.configuracion.grado;

import java.util.List;
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
@RequestMapping("/api/grados")
public class GradoController {

    private final GradoService gradoService;

    public GradoController(GradoService gradoService) {
        this.gradoService = gradoService;
    }

    @GetMapping
    public List<Grado> listar() {
        return gradoService.listar();
    }

    @GetMapping("/{id}")
    public Grado obtener(@PathVariable Integer id) {
        return gradoService.obtenerPorId(id);
    }

    @PostMapping
    public ResponseEntity<Grado> crear(@RequestBody Grado grado) {
        Grado creado = gradoService.crear(grado);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    public Grado actualizar(@PathVariable Integer id, @RequestBody Grado datos) {
        return gradoService.actualizar(id, datos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        gradoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}