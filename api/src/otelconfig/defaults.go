package otelconfig

import (
	"fmt"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
	"net/http"
)

// ScopeName is the root name of this application from a Telemetry perspective.
const ScopeName = "big-react-app-api"

// SpanName returns the default name to use when creating a new span.
func SpanName(r *http.Request) string {
	return fmt.Sprintf("%s %s", r.Method, r.URL.Path)
}

// NewTracer returns a new Tracer with the defaults set for this application.
func NewTracer() trace.Tracer {
	return otel.Tracer(ScopeName)
}

// NewMeter returns a new Meter with the defaults set for this application and the name
// parameter appended to the scope name.
func NewMeter(name string) metric.Meter {

	fullName := fmt.Sprintf("%s/%s", ScopeName, name)
	return otel.Meter(fullName)
}
