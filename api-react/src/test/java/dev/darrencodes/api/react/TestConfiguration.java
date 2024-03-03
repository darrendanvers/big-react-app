package dev.darrencodes.api.react;

import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtDecoder;

/**
 * Creates configuration classes for tests.
 *
 * @author darren
 */
@Configuration
public class TestConfiguration {

    @MockBean
    private JwtDecoder jwtDecoder;
}
