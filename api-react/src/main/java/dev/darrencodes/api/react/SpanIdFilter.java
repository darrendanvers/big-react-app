package dev.darrencodes.api.react;


import java.io.IOException;
import java.util.Objects;

import io.opentelemetry.api.trace.Span;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * HTTP Filter that will add trace ID and span ID to the logs if they are present.
 *
 * @author darren
 */
@Component
@Order(1)
public class SpanIdFilter implements Filter {

    private static final String SPAN_ID_KEY = "logging.googleapis.com/spanId";
    private static final String TRACE_ID_KEY = "traceId";

    @Override
    public void doFilter(final ServletRequest servletRequest, final ServletResponse servletResponse,
                         final FilterChain filterChain) throws IOException, ServletException {

        final Span span = Span.current();
        boolean added = false;

        if (Objects.nonNull(span) && Objects.nonNull(span.getSpanContext())) {
            added = true;
            MDC.put(SPAN_ID_KEY, span.getSpanContext().getSpanId());
            MDC.put(TRACE_ID_KEY, span.getSpanContext().getTraceId());
        }

        filterChain.doFilter(servletRequest, servletResponse);

        if (added) {
            MDC.remove(SPAN_ID_KEY);
            MDC.remove(TRACE_ID_KEY);
        }
    }
}
