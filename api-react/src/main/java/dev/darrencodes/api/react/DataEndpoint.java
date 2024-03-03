package dev.darrencodes.api.react;

import java.util.Objects;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * The REST endpoint handler for data requests.
 *
 * @author darren
 */
@Slf4j
@RestController
@RequestMapping("/data")
public class DataEndpoint {

    /**
     * A basic response object.
     *
     * @author darren
     */
    @Getter
    @Setter
    @Accessors(chain = true)
    private static final class Response {
        private String property;
    }

    /**
     * Handles GET requests.
     *
     * @param parameter The parameter to return in the response. Will return the text "null" if supplied a null.
     * @return A Response object with the parameter returned.
     */
    @GetMapping
    public Response get(@RequestParam final String parameter) {

        final String response = Objects.isNull(parameter) ? "null" : parameter;

        log.info("Returning {}.", response);
        return new Response().setProperty(response);
    }
}
