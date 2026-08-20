package co.edu.unab.gimpafre.matricula.matricula;

import jakarta.validation.constraints.NotNull;

public record CambioEstadoRequestDTO(
    @NotNull(message = "El estado destino es obligatorio")
    MatriculaEstado estado
) {}