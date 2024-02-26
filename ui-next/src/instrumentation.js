/**
 * If running in a Node.js runtime, enables Open Telemetry instrumentation.
 *
 * @returns {Promise<void>}
 */
export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        // Using the logger at this point triggers errors.
        console.log('Enabling OTEL instrumentation.')
        await import('./instrumentation.node.js')
    }
}