// Export environment variables so we know their types.
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            APP_SERVER_API_BASE_URI: string;
            APP_VERSION: string;
            APP_LOCAL_OIDC_CLIENT_ID: string;
            APP_LOCAL_OIDC_CLIENT_SECRET: string
            LOCAL_OIDC_WELL_KNOWN: string;
            APP_OTEL_COLLECTOR_URI: string;
            APP_AUTH_DB_USER: string;
            APP_AUTH_DB_PASSWORD: string;
            APP_AUTH_DB_HOST: string;
            APP_AUTH_DB_DB: string;
            APP_AUTH_DB_PORT: number;
        }
    }
}

export {}