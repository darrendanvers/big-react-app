package dev.darrencodes.api.react;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main driver application.
 *
 * @author darren
 */
@SpringBootApplication
@SuppressWarnings("PMD.UseUtilityClass")
public class ApiReactApplication {

    /**
     * The application main method.
     *
     * @param args The application's command line arguments.
     */
    public static void main(final String[] args) {
        SpringApplication.run(ApiReactApplication.class, args);
    }
}
