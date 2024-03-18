import winston from "winston";
import opentelemetry from "@opentelemetry/api";
import {Format, TransformableInfo} from "logform";

const { combine, timestamp, json } = winston.format;


// Adds a severity key to the log message. This will translate
// from the default Winston levels to those understood by GCP.
// This will allow multiple tools to be able to interpret the log levels.
const gcpLogLevels: Format = {
    transform: (info: TransformableInfo): TransformableInfo =>{
        let severity;
        switch(info.level) {
            case 'error':
                severity = 'ERROR';
                break
            case 'warn':
                severity = 'WARNING';
                break
            case 'info':
                severity = 'INFO';
                break;
            case 'verbose':
            case 'debug':
                severity = 'DEBUG';
                break;
            default:
                severity = 'DEFAULT';
        }
        info.severity = severity;
        return info;
    }
}

// If present, adds a traceId and spanId to log messages.
const traceAndSpan: Format = {
    transform: (info: TransformableInfo): TransformableInfo => {

        const activeSpan = opentelemetry.trace.getActiveSpan();
        if (activeSpan != null) {
            info.traceId = activeSpan.spanContext().traceId;
            info["logging.googleapis.com/spanId"] = activeSpan.spanContext().spanId
        }
        return info;
    }
}

/**
 * Global logger.
 *
 * @type {winston.Logger}
 */
const logger: winston.Logger = winston.createLogger( {
    level: process.env.LOG_LEVEL || 'info',
    format: combine(timestamp(), traceAndSpan, gcpLogLevels, json()),
    transports: [new winston.transports.Console()],
});
export {logger};