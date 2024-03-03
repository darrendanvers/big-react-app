package dev.darrencodes.api.react;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configures endpoint security.
 *
 * @author darren
 */
@Configuration
@EnableWebSecurity
public class AuthorizationConfiguration {

    /**
     * Constructs a SecurityFilterChain that includes a custom JWT AuthorizationConverter.
     *
     * @param http The HTTP security builder being constructed.
     * @return The SecurityFilterChain after configuration.
     * @throws Exception Any error will be propagated.
     */
    @Bean
    public SecurityFilterChain filterChain(final HttpSecurity http) throws Exception {

        http.authorizeHttpRequests(authorize -> authorize.anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(new JwtAuthorizationConverter())));
        return http.build();
    }
}
