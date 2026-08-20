package co.edu.unab.gimpafre.horarios;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/bloques-horario")
@RequiredArgsConstructor
public class BloqueHorarioController {

    private final BloqueHorarioRepository bloqueHorarioRepository;

    @GetMapping
    public List<BloqueHorario> listar() {
        return bloqueHorarioRepository.findAll();
    }
}
