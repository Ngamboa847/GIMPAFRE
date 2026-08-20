package co.edu.unab.gimpafre.configuracion.grupo;

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
@RequestMapping("/api/grupos")
public class GrupoController {

    private final GrupoService grupoService;

    public GrupoController(GrupoService grupoService) {
        this.grupoService = grupoService;
    }

    @GetMapping
    public List<Grupo> listar() {
        return grupoService.listar();
    }

    @GetMapping("/ano-lectivo/{idAnoLectivo}")
    public List<Grupo> listarPorAnoLectivo(@PathVariable Integer idAnoLectivo) {
        return grupoService.listarPorAnoLectivo(idAnoLectivo);
    }

    @GetMapping("/grado/{idGrado}/ano-lectivo/{idAnoLectivo}")
    public List<Grupo> listarPorGradoYAno(@PathVariable Integer idGrado,
                                          @PathVariable Integer idAnoLectivo) {
        return grupoService.listarPorGradoYAno(idGrado, idAnoLectivo);
    }

    @GetMapping("/{id}")
    public Grupo obtener(@PathVariable Integer id) {
        return grupoService.obtenerPorId(id);
    }

    @PostMapping
    public ResponseEntity<Grupo> crear(@RequestBody Grupo grupo,
                                       @RequestParam Integer idGrado,
                                       @RequestParam Integer idAnoLectivo) {
        Grupo creado = grupoService.crear(grupo, idGrado, idAnoLectivo);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    public Grupo actualizar(@PathVariable Integer id, @RequestBody Grupo datos) {
        return grupoService.actualizar(id, datos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        grupoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}