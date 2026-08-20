package co.edu.unab.gimpafre.personas.estudiantefamiliar;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/estudiante-familiar")
public class EstudianteFamiliarController {

    private final EstudianteFamiliarService estudianteFamiliarService;

    public EstudianteFamiliarController(EstudianteFamiliarService estudianteFamiliarService) {
        this.estudianteFamiliarService = estudianteFamiliarService;
    }

    @GetMapping("/estudiante/{idEstudiante}")
    public List<EstudianteFamiliar> listarPorEstudiante(@PathVariable Integer idEstudiante) {
        return estudianteFamiliarService.listarPorEstudiante(idEstudiante);
    }

    @GetMapping("/{id}")
    public EstudianteFamiliar obtener(@PathVariable Integer id) {
        return estudianteFamiliarService.obtenerPorId(id);
    }

    @PostMapping
    public ResponseEntity<EstudianteFamiliar> crear(@RequestBody EstudianteFamiliar vinculo,
                                                    @RequestParam Integer idEstudiante,
                                                    @RequestParam Integer idFamiliar) {
        EstudianteFamiliar creado = estudianteFamiliarService.crear(vinculo, idEstudiante, idFamiliar);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    public EstudianteFamiliar actualizar(@PathVariable Integer id,
                                         @RequestBody EstudianteFamiliar datos) {
        return estudianteFamiliarService.actualizar(id, datos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        estudianteFamiliarService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}