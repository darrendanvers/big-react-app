// Export environment variables so we know their types.
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            APP_SERVER_API_BASE_URI: string;
            APP_VERSION: string;
        }
    }
}

export {}