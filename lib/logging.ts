export interface Logger {
    debug: (message: string, meta?: object) => void;
    info: (message: string, meta?: object) => void;
    error: (message: string, error: any, meta?: object) => void;
}

const basicLogger: Logger = {
    debug(message: string, meta?: object): void {
        console.debug("[DEBUG]", message, meta)
    },
    error(message: string, error: any, meta?: object): void {
        console.error("[ERROR]", message, error, meta)
    },
    info(message: string, meta?: object): void {
        console.info("[INFO]", message, meta);
    }
};

// Global logger instance, initially set to basicLogger.
let globalLogger: Logger = basicLogger;

// Function to allow consumers to set their own logger.
export const setLogger = (newLogger: Logger) => {
    globalLogger = newLogger;
};

// Export a logger that delegates to the current global logger.
export const logger: Logger = {
    debug(message: string, meta?: object): void {
        globalLogger.debug(message, meta);
    },
    error(message: string, error: any, meta?: object): void {
        globalLogger.error(message, error, meta);
    },
    info(message: string, meta?: object): void {
        globalLogger.info(message, meta);
    }
};

export const prefixedLogger = (prefix: string): Logger => ({
    debug(message: string, meta?: object): void {
        globalLogger.debug(`[${prefix}] ${message}`, meta);
    },
    error(message: string, error: any, meta?: object): void {
        globalLogger.error(`[${prefix}] ${message}`, error, meta);
    },
    info(message: string, meta?: object): void {
        globalLogger.info(`[${prefix}] ${message}`, meta);
    }
});
