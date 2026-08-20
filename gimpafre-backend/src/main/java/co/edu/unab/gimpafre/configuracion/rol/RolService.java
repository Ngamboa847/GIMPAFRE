package co.edu.unab.gimpafre.configuracion.rol;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import co.edu.unab.gimpafre.config.RecursoNoEncontradoException;
import co.edu.unab.gimpafre.config.RecursoDuplicadoException;

@Service
public class RolService {

    private final RolRepository rolRepository;

    public RolService(RolRepository rolRepository) {
        this.rolRepository = rolRepository;
    }

    @Transactional(readOnly = true)
    public List<Rol> listar() {
        return rolRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Rol obtenerPorId(Integer id) {
        return rolRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
        "No existe un rol con id " + id));
    }

    @Transactional
    public Rol crear(Rol rol) {
        if (rolRepository.existsByCodigo(rol.getCodigo())) {
    throw new RecursoDuplicadoException(
            "Ya existe un rol con el codigo " + rol.getCodigo());
}
        return rolRepository.save(rol);
    }

    @Transactional
    public Rol actualizar(Integer id, Rol datos) {
        Rol rol = obtenerPorId(id);
        rol.setDenominacion(datos.getDenominacion());
        return rolRepository.save(rol);
    }

    @Transactional
    public void eliminar(Integer id) {
        Rol rol = obtenerPorId(id);
        rolRepository.delete(rol);
    }
}