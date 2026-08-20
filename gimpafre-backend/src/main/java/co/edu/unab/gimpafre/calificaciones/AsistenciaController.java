package co.edu.unab.gimpafre.calificaciones;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Shortcut: solo GET, mismo patrón que Carga Académica (sin service ni DTO).
@RestController
@RequestMapping("/api/asistencia")
@RequiredArgsConstructor
public class AsistenciaController {

    private final AsistenciaRepository asistenciaRepository;

    @GetMapping
    public List<Asistencia> listar() {
        return asistenciaRepository.findAll();
    }
}
