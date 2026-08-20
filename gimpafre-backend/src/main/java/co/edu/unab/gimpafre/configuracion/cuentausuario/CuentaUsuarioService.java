package co.edu.unab.gimpafre.configuracion.cuentausuario;

import java.time.LocalDate;
import java.util.List;

import co.edu.unab.gimpafre.config.RecursoDuplicadoException;
import co.edu.unab.gimpafre.config.RecursoNoEncontradoException;
import co.edu.unab.gimpafre.configuracion.rol.Rol;
import co.edu.unab.gimpafre.configuracion.rol.RolRepository;
import co.edu.unab.gimpafre.personas.docente.Docente;
import co.edu.unab.gimpafre.personas.docente.DocenteRepository;
import co.edu.unab.gimpafre.personas.estudiante.Estudiante;
import co.edu.unab.gimpafre.personas.estudiante.EstudianteRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CuentaUsuarioService {

    private final CuentaUsuarioRepository cuentaUsuarioRepository;
    private final RolRepository rolRepository;
    private final DocenteRepository docenteRepository;
    private final EstudianteRepository estudianteRepository;
    private final PasswordEncoder passwordEncoder;

    public CuentaUsuarioService(CuentaUsuarioRepository cuentaUsuarioRepository,
                                RolRepository rolRepository,
                                DocenteRepository docenteRepository,
                                EstudianteRepository estudianteRepository,
                                PasswordEncoder passwordEncoder) {
        this.cuentaUsuarioRepository = cuentaUsuarioRepository;
        this.rolRepository = rolRepository;
        this.docenteRepository = docenteRepository;
        this.estudianteRepository = estudianteRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<CuentaUsuarioResponseDTO> listar() {
        return cuentaUsuarioRepository.findAll().stream()
                .map(CuentaUsuarioMapper::aResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public CuentaUsuarioResponseDTO obtenerPorId(Integer id) {
        CuentaUsuario cuenta = cuentaUsuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe una cuenta de usuario con id " + id));
        return CuentaUsuarioMapper.aResponseDTO(cuenta);
    }

    @Transactional
    public CuentaUsuarioResponseDTO crear(CuentaUsuarioRequestDTO request) {
        if (cuentaUsuarioRepository.existsByNombreUsuario(request.getNombreUsuario())) {
            throw new RecursoDuplicadoException(
                    "Ya existe una cuenta con el nombre de usuario " + request.getNombreUsuario());
        }

        Rol rol = rolRepository.findById(request.getIdRol())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe un rol con id " + request.getIdRol()));

        CuentaUsuario cuenta = new CuentaUsuario();
        cuenta.setNombreUsuario(request.getNombreUsuario());
        cuenta.setCredenciales(passwordEncoder.encode(request.getCredenciales()));
        cuenta.setEstado(CuentaEstado.ACTIVO);
        cuenta.setFechaCreacion(LocalDate.now());
        cuenta.setRol(rol);

        if (request.getIdDocente() != null) {
            Docente docente = docenteRepository.findById(request.getIdDocente())
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "No existe un docente con id " + request.getIdDocente()));
            cuenta.setDocente(docente);
        }
        if (request.getIdEstudiante() != null) {
            Estudiante estudiante = estudianteRepository.findById(request.getIdEstudiante())
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "No existe un estudiante con id " + request.getIdEstudiante()));
            cuenta.setEstudiante(estudiante);
        }

        CuentaUsuario guardada = cuentaUsuarioRepository.save(cuenta);
        return CuentaUsuarioMapper.aResponseDTO(guardada);
    }

    @Transactional
    public CuentaUsuarioResponseDTO actualizar(Integer id, CuentaEstado estado) {
        CuentaUsuario cuenta = cuentaUsuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe una cuenta de usuario con id " + id));
        cuenta.setEstado(estado);
        CuentaUsuario guardada = cuentaUsuarioRepository.save(cuenta);
        return CuentaUsuarioMapper.aResponseDTO(guardada);
    }

    @Transactional
    public void eliminar(Integer id) {
        CuentaUsuario cuenta = cuentaUsuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe una cuenta de usuario con id " + id));
        cuentaUsuarioRepository.delete(cuenta);
    }
}