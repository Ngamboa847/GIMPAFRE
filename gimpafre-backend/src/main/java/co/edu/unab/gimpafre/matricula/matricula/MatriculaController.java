package co.edu.unab.gimpafre.matricula.matricula;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/matriculas")
public class MatriculaController {

    private final MatriculaService matriculaService;

    public MatriculaController(MatriculaService matriculaService) {
        this.matriculaService = matriculaService;
    }

    @GetMapping
    public List<Matricula> listar() {
        return matriculaService.listar();
    }

    @GetMapping("/ano-lectivo/{idAnoLectivo}")
    public List<Matricula> listarPorAnoLectivo(@PathVariable Integer idAnoLectivo) {
        return matriculaService.listarPorAnoLectivo(idAnoLectivo);
    }

    @GetMapping("/estudiante/{idEstudiante}")
    public List<Matricula> listarPorEstudiante(@PathVariable Integer idEstudiante) {
        return matriculaService.listarPorEstudiante(idEstudiante);
    }

    @GetMapping("/{id}")
    public Matricula obtener(@PathVariable Integer id) {
        return matriculaService.obtenerPorId(id);
    }

    @PostMapping
    public ResponseEntity<Matricula> crear(@RequestBody Matricula matricula,
                                           @RequestParam Integer idEstudiante,
                                           @RequestParam Integer idAnoLectivo,
                                           @RequestParam Integer idGrado,
                                           @RequestParam(required = false) Integer idGrupo) {
        Matricula creada = matriculaService.crear(
                matricula, idEstudiante, idAnoLectivo, idGrado, idGrupo);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    @PutMapping("/{id}")
    public Matricula actualizar(@PathVariable Integer id,
                                @RequestBody Matricula datos,
                                @RequestParam(required = false) Integer idGrado,
                                @RequestParam(required = false) Integer idGrupo) {
        return matriculaService.actualizar(id, datos, idGrado, idGrupo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        matriculaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Matricula> cambiarEstado(
            @PathVariable Integer id,
            @Valid @RequestBody CambioEstadoRequestDTO request) {
        Matricula actualizada = matriculaService.cambiarEstado(id, request.estado());
        return ResponseEntity.ok(actualizada);
    }

    @PatchMapping("/{id}/simat")
    public ResponseEntity<Matricula> actualizarRegistroSimat(
            @PathVariable Integer id,
            @Valid @RequestBody RegistroSimatRequestDTO request) {
        Matricula actualizada = matriculaService.actualizarRegistroSimat(id, request.registro());
        return ResponseEntity.ok(actualizada);
    }
}