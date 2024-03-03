package dev.darrencodes.api.react;

import java.util.List;

import io.opentelemetry.instrumentation.annotations.WithSpan;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * The REST endpoint handler for requests about the user.
 *
 * @author darren
 */
@Slf4j
@RestController
@RequestMapping("/user")
public class UserEndpoint {

    /**
     * Wrapper class containing information about the user.
     *
     * @author darren
     */
    @Getter
    @Setter
    @Accessors(chain = true)
    private static final class User {
        private String userId;
        private List<String> permissions;
    }

    /**
     * Returns details about the user.
     *
     * @return A User object containing details about the user.
     */
    @GetMapping
    @WithSpan
    public User getUser() {

        final Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        log.info("Returning user data for {}.", authentication.getName());
        return new User().setUserId(authentication.getName())
                .setPermissions(authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList());
    }
}
