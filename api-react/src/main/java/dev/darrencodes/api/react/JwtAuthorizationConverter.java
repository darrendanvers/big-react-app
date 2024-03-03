package dev.darrencodes.api.react;

import java.util.List;
import java.util.Objects;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

/**
 * Converter that will take in a raw JWT, determine the GrantedAuthorities for its principal, and return
 * a token with both.
 *
 * @author darren
 */
public class JwtAuthorizationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private static final GrantedAuthority ADMIN = () -> "admin";
    private static final GrantedAuthority VIEW = () -> "view";

    @Override
    public AbstractAuthenticationToken convert(final Jwt source) {

        List<GrantedAuthority> grantedAuthorities;
        if (Objects.equals("ddddd", source.getSubject())) {
            grantedAuthorities = getAdminAuthorities();
        } else {
            grantedAuthorities = getViewOnlyAuthorities();
        }
        return new JwtAuthenticationToken(source, grantedAuthorities);
    }

    private static List<GrantedAuthority> getAdminAuthorities() {
        return List.of(ADMIN, VIEW);
    }

    private static List<GrantedAuthority> getViewOnlyAuthorities() {
        return List.of(VIEW);
    }
}
