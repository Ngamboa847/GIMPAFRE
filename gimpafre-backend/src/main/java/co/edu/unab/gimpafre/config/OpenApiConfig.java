package co.edu.unab.gimpafre.config;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String NOMBRE_ESQUEMA = "bearerAuth";

    @Bean
    public OpenAPI gimpafreOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API GIMPAFRE - Plataforma de Gestión Académica")
                        .description("Servicios REST para la gestión académica del "
                                + "Gimnasio Pedagógico Paulo Freire: configuración base, "
                                + "matrícula, y administración de cuentas de usuario.")
                        .version("1.0.0")
                        .license(new License()
                                .name("Uso académico - UNAB")))
                .addSecurityItem(new SecurityRequirement().addList(NOMBRE_ESQUEMA))
                .components(new Components()
                        .addSecuritySchemes(NOMBRE_ESQUEMA, new SecurityScheme()
                                .name(NOMBRE_ESQUEMA)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}