import {NodeSDK} from "@opentelemetry/sdk-node";
import {Resource} from "@opentelemetry/resources";
import {SemanticResourceAttributes} from "@opentelemetry/semantic-conventions";
import {ConsoleSpanExporter, SimpleSpanProcessor} from "@opentelemetry/sdk-trace-node";
import {OTLPTraceExporter} from "@opentelemetry/exporter-trace-otlp-http";
import {logger} from "@/util/logging";

// If the APP_OTEL_COLLECTOR_URI environment variable is defined, send telemetry there. If not, just
// send it to the console.
let traceExporter = new ConsoleSpanExporter();

if (process.env.APP_OTEL_COLLECTOR_URI) {
    const exporterOptions = {
        url: process.env.OTEL_COLLECTOR_URI,
    }
    traceExporter = new OTLPTraceExporter(exporterOptions);
}

// Configure Open Telemetry instrumentation.
const sdk = new NodeSDK({
    resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'ui-next',
    }),
    traceExporter: traceExporter,
})
sdk.start();

// Gracefully shut down the instrumentation.
process.on('SIGTERM', () => {
    sdk.shutdown()
        .then(() => logger.info('Tracing terminated.'))
        .catch((error) => logger.error(`Error terminating tracing: ${error}.`));
});