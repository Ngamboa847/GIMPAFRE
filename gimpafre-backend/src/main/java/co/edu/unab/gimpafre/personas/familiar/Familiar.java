package co.edu.unab.gimpafre.personas.familiar;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "Familiar")
@Getter
@Setter
public class Familiar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_familiar")
    private Integer idFamiliar;

    @Column(name = "tipo_documento", length = 20)
    private String tipoDocumento;

    @Column(name = "numero_documento", length = 30)
    private String numeroDocumento;

    @Column(name = "primer_nombre", nullable = false, length = 60)
    private String primerNombre;

    @Column(name = "segundo_nombre", length = 60)
    private String segundoNombre;

    @Column(name = "primer_apellido", nullable = false, length = 60)
    private String primerApellido;

    @Column(name = "segundo_apellido", length = 60)
    private String segundoApellido;

    @Column(name = "direccion", length = 150)
    private String direccion;

    @Column(name = "telefono", length = 30)
    private String telefono;

    @Column(name = "ocupacion", length = 80)
    private String ocupacion;

    @Column(name = "empresa", length = 120)
    private String empresa;

    @Column(name = "estado_civil", length = 40)
    private String estadoCivil;
}