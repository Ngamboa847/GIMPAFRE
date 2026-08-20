package co.edu.unab.gimpafre.configuracion.periodo;

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
@RequestMapping("/api/periodos")
public class PeriodoController {

    private final PeriodoService periodoService;

    public PeriodoController(PeriodoService periodoService) {
        this.periodoService = periodoService;
    }

    @GetMapping
    public List<Periodo> listar() {
        return periodoService.listar();
    }

    @GetMapping("/ano-lectivo/{idAnoLectivo}")
    public List<Periodo> listarPorAnoLectivo(@PathVariable Integer idAnoLectivo) {
        return periodoService.listarPorAnoLectivo(idAnoLectivo);
    }

    @GetMapping("/{id}")
    public Periodo obtener(@PathVariable Integer id) {
        return periodoService.obtenerPorId(id);
    }

    @PostMapping
    public ResponseEntity<Periodo> crear(@RequestBody Periodo periodo,
                                         @RequestParam Integer idAnoLectivo) {
        Periodo creado = periodoService.crear(periodo, idAnoLectivo);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    public Periodo actualizar(@PathVariable Integer id, @RequestBody Periodo datos) {
        return periodoService.actualizar(id, datos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        periodoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}