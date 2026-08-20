package co.edu.unab.gimpafre.configuracion.anolectivo;

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
@RequestMapping("/api/anos-lectivos")
public class AnoLectivoController {

    private final AnoLectivoService anoLectivoService;

    public AnoLectivoController(AnoLectivoService anoLectivoService) {
        this.anoLectivoService = anoLectivoService;
    }

    @GetMapping
    public List<AnoLectivo> listar() {
        return anoLectivoService.listar();
    }

    @GetMapping("/{id}")
    public AnoLectivo obtener(@PathVariable Integer id) {
        return anoLectivoService.obtenerPorId(id);
    }

    @PostMapping
    public ResponseEntity<AnoLectivo> crear(@RequestBody AnoLectivo anoLectivo) {
        AnoLectivo creado = anoLectivoService.crear(anoLectivo);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    public AnoLectivo actualizar(@PathVariable Integer id, @RequestBody AnoLectivo datos) {
        return anoLectivoService.actualizar(id, datos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        anoLectivoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}