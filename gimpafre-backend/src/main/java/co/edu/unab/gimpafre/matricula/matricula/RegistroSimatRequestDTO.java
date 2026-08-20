package co.edu.unab.gimpafre.matricula.matricula;

import jakarta.validation.constraints.NotNull;

public record RegistroSimatRequestDTO(
    @NotNull(message = "El estado de registro SIMAT es obligatorio")
    RegistroSimat registro
) {}