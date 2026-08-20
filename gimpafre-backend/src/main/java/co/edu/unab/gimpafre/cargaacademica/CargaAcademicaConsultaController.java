package co.edu.unab.gimpafre.cargaacademica;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Shortcut deliberado: solo GET, sin service ni DTO, mismo patron que ya
// usan Grado/Grupo/AnoLectivo/etc (Cap3 backend: "solo CuentaUsuario usa
// DTO, las demas entidades se exponen directamente"). Documentado como
// tal — no hay POST/PUT/DELETE todavia para estas 4 tablas.

@RestController
@RequestMapping("/api/areas")
@RequiredArgsConstructor
class AreaController {
    private final AreaRepository areaRepository;

    @GetMapping
    List<Area> listar() {
        return areaRepository.findAll();
    }
}

@RestController
@RequestMapping("/api/asignaturas")
@RequiredArgsConstructor
class AsignaturaController {
    private final AsignaturaRepository asignaturaRepository;

    @GetMapping
    List<Asignatura> listar() {
        return asignaturaRepository.findAll();
    }
}

@RestController
@RequestMapping("/api/plan-estudios")
@RequiredArgsConstructor
class PlanEstudiosController {
    private final PlanEstudiosRepository planEstudiosRepository;

    @GetMapping
    List<PlanEstudios> listar() {
        return planEstudiosRepository.findAll();
    }
}

@RestController
@RequestMapping("/api/asignaciones-docente")
@RequiredArgsConstructor
class AsignacionDocenteController {
    private final AsignacionDocenteRepository asignacionDocenteRepository;

    @GetMapping
    List<AsignacionDocente> listar() {
        return asignacionDocenteRepository.findAll();
    }
}
