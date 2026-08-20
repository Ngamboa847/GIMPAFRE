package co.edu.unab.gimpafre.personas.familiar;

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
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/familiares")
public class FamiliarController {

    private final FamiliarService familiarService;

    public FamiliarController(FamiliarService familiarService) {
        this.familiarService = familiarService;
    }

    @GetMapping
    public List<Familiar> listar() {
        return familiarService.listar();
    }

    @GetMapping("/{id}")
    public Familiar obtener(@PathVariable Integer id) {
        return familiarService.obtenerPorId(id);
    }

    @PostMapping
    public ResponseEntity<Familiar> crear(@RequestBody Familiar familiar) {
        Familiar creado = familiarService.crear(familiar);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    public Familiar actualizar(@PathVariable Integer id, @RequestBody Familiar datos) {
        return familiarService.actualizar(id, datos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        familiarService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/buscar")
    public Familiar buscarPorDocumento(@RequestParam String numeroDocumento) {
        return familiarService.buscarPorDocumento(numeroDocumento);
    }
}