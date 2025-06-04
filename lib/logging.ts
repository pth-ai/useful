import {hasOwnProperty} from "./tsUtils";
import * as uuid from "uuid";
import {switcher} from "./switcher";

// Helper function to determine the environment
const isNode = typeof process !== 'undefined' &&
    process.versions != null &&
    process.versions.node != null;

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

// --- ANSI Colors for Node.js (only if TTY) ---
const TTY_COLORS = {
    RESET: "\x1b[0m",
    BRIGHT: "\x1b[1m",
    DIM: "\x1b[2m",
    UNDERSCORE: "\x1b[4m",
    BLINK: "\x1b[5m",
    REVERSE: "\x1b[7m",
    HIDDEN: "\x1b[8m",

    FG: {
        BLACK: "\x1b[30m",
        RED: "\x1b[31m",
        GREEN: "\x1b[32m",
        YELLOW: "\x1b[33m",
        BLUE: "\x1b[34m",
        MAGENTA: "\x1b[35m",
        CYAN: "\x1b[36m",
        WHITE: "\x1b[37m",
        GRAY: "\x1b[90m"
    },
    BG: {
        BLACK: "\x1b[40m",
        RED: "\x1b[41m",
        GREEN: "\x1b[42m",
        YELLOW: "\x1b[43m",
        BLUE: "\x1b[44m",
        MAGENTA: "\x1b[45m",
        CYAN: "\x1b[46m",
        WHITE: "\x1b[47m",
        GRAY: "\x1b[100m"
    }
};

const IS_TTY = isNode && process.stdout && process.stdout.isTTY;

function colorizeNode(text: string, color: string): string {
    return IS_TTY ? `${color}${text}${TTY_COLORS.RESET}` : text;
}

// Initialize variables
let __filename_logging: string = ''; // Renamed to avoid conflict if user also has __filename
let pathUtils: any = { // Basic fallback for browser or if Node modules fail to load
    basename: (path: string, ext?: string) => {
        const parts = path.split(/[/\\]/); // Handle both / and \
        const filename = parts[parts.length - 1];
        if (ext && filename.endsWith(ext)) {
            return filename.slice(0, -ext.length);
        }
        return filename;
    },
    extname: (path: string) => {
        const parts = path.split('.');
        return parts.length > 1 ? '.' + parts[parts.length - 1] : '';
    }
};

// Function to initialize Node.js specific modules
const initializeNodeModules = async () => {
    if (isNode) {
        try {
            const [{fileURLToPath}, pathModule] = await Promise.all([
                import('url'),
                import('path')
            ]);
            // In ESM, import.meta.url is the standard way to get the current file's URL
            if (typeof import.meta !== 'undefined' && import.meta.url) {
                 __filename_logging = fileURLToPath(import.meta.url);
            } else {
                // Fallback for CJS environments if this module somehow runs there, though less likely with dynamic imports
                // __filename_logging = __filename; // This __filename is only available in CJS
                console.warn('Could not determine __filename_logging using import.meta.url. Caller filename resolution might be affected.');
            }
            pathUtils = pathModule;
        } catch (e) {
            console.warn('Failed to load Node.js specific modules for logging:', e);
        }
    }
};

// Initialize immediately
initializeNodeModules().catch(e => console.error("Error initializing logging node modules:", e));

interface LogEntry {
    level: 'info' | 'debug' | 'error' | 'warn' | string; // 'warn' was 'warm' - assuming typo
    message: string;
    timestamp: string; // Added timestamp
    [optionName: string]: any;
}

// CTLogger is an internal type used by Logging class, it might need setLastId
type CTLogger = Logger & { setLastId?: (lastId: string) => void };

export interface Logger {
    debug: (message: string, meta?: object) => void;
    info: (message: string, meta?: object) => void;
    warn: (message: string, meta?: object) => void;
    error: (message: string, error?: any, meta?: object) => void; // error can be optional
    log: (entry: LogEntry) => void;
    getLastId: () => string;
    setLastId: (lastId: string) => void;
}

let lastId = ""; // Global for the basicLogger instance

const basicLogger: Logger & { setLastId: (lastId: string) => void } = {
    log(entry: LogEntry): void {
        // Ensure meta exists
        const meta = entry.meta || {};
        // The switcher helps call the right typed method below
        switcher<typeof entry.level>()
            .when('info', () => basicLogger.info(entry.message, meta))
            .when('debug', () => basicLogger.debug(entry.message, meta))
            .when('error', () => basicLogger.error(entry.message, entry['error'], meta))
            .when('warn', () => basicLogger.warn(entry.message, meta)) // was 'warm'
            .fallback(() => basicLogger.info(entry.message, meta)) // Default to info
            .checkExhaustive()
            .exec(entry.level);
    },
    debug(message: string, meta?: object): void {
        const timestamp = new Date().toISOString();
        if (isNode) {
            console.debug(
                colorizeNode(`[${timestamp}]`, TTY_COLORS.FG.GRAY),
                colorizeNode('[DEBUG]', TTY_COLORS.FG.MAGENTA),
                message,
                meta || ''
            );
        } else if (isBrowser) {
            console.debug(
                `%c[${timestamp}] %c[DEBUG]%c ${message}`,
                'color: gray',
                'color: magenta; font-weight: bold;',
                'color: inherit;',
                meta || ''
            );
        } else {
            console.debug(`[${timestamp}] [DEBUG]`, message, meta || '');
        }
    },
    error(message: string, error?: any, meta?: object): void {
        const timestamp = new Date().toISOString();
        if (isNode) {
            console.error(
                colorizeNode(`[${timestamp}]`, TTY_COLORS.FG.GRAY),
                colorizeNode('[ERROR]', TTY_COLORS.BRIGHT + TTY_COLORS.FG.RED),
                message,
                ...(error ? [error] : []), // Spread error if it exists
                meta || ''
            );
        } else if (isBrowser) {
            console.error(
                `%c[${timestamp}] %c[ERROR]%c ${message}`,
                'color: gray;',
                'color: red; font-weight: bold;',
                'color: inherit;',
                ...(error ? [error] : []),
                meta || ''
            );
        } else {
            console.error(`[${timestamp}] [ERROR]`, message, ...(error ? [error] : []), meta || '');
        }
    },
    info(message: string, meta?: object): void {
        const timestamp = new Date().toISOString();
        if (isNode) {
            console.info(
                colorizeNode(`[${timestamp}]`, TTY_COLORS.FG.GRAY),
                colorizeNode('[INFO]', TTY_COLORS.FG.GREEN),
                message,
                meta || ''
            );
        } else if (isBrowser) {
            console.info(
                `%c[${timestamp}] %c[INFO]%c ${message}`,
                'color: gray;',
                'color: green; font-weight: bold;',
                'color: inherit;',
                meta || ''
            );
        } else {
            console.info(`[${timestamp}] [INFO]`, message, meta || '');
        }
    },
    warn(message: string, meta?: object): void { // was 'warm', console.info
        const timestamp = new Date().toISOString();
        if (isNode) {
            console.warn(
                colorizeNode(`[${timestamp}]`, TTY_COLORS.FG.GRAY),
                colorizeNode('[WARN]', TTY_COLORS.BRIGHT + TTY_COLORS.FG.YELLOW),
                message,
                meta || ''
            );
        } else if (isBrowser) {
            console.warn(
                `%c[${timestamp}] %c[WARN]%c ${message}`,
                'color: gray;',
                'color: orange; font-weight: bold;', // Using orange for browser warn
                'color: inherit;',
                meta || ''
            );
        } else {
            console.warn(`[${timestamp}] [WARN]`, message, meta || '');
        }
    },
    setLastId(lastIdToSet: string): void {
        lastId = lastIdToSet;
    },
    getLastId(): string {
        return lastId;
    }
};

// Global logger instance, initially set to basicLogger.
let globalLogger: Logger = basicLogger;

// Function to allow consumers to set their own logger.
export const setLogger = (newLogger: Logger) => {
    globalLogger = newLogger;
};

export const getGlobalLogger = (): Logger => globalLogger;

const serverId = uuid.v4().substring(0, 5);

export const createLoggerForFile = (sourceFileUrl?: string) => {
    let componentName = 'unknown-source';
    if (isNode) {
        let callerFileName = '';
        if (sourceFileUrl) { // Prefer explicitly passed URL
            try {
                callerFileName = new URL(sourceFileUrl).pathname;
            } catch (e) {
                // if not a valid URL, might be a path already
                callerFileName = sourceFileUrl;
            }
        } else {
            // Node.js specific stack trace handling (attempt to auto-detect)
            // This is fragile and might not work perfectly in all scenarios (e.g., transpiled code, bundled code)
        const err = new Error();
        const stack = err.stack || '';
        const stackLines = stack.split('\n');

            // Look for the first line in the stack that is NOT this logging file.
            // Regex to capture file path:
            // - (?:(?:file|https?):[/]{2,3}[^/]+)? -> Optional scheme and host for file URLs or http URLs
            // - ([\w\-. /\\:]+?\.(?:js|ts|mjs|cjs)) -> Capture path ending with common JS/TS extensions
            // - :\d+:\d+ -> Line and column number
            const fileMatchRegex = /(?:at\s+(?:.*?)\s+\()?(?:(?:file|https?):[/]{2,3}[^/]+)?([\w\-. /\\:]+?\.(?:js|ts|mjs|cjs)):\d+:\d+\)?/i;

            for (let i = 1; i < stackLines.length; i++) { // Start from 1 to skip Error line
                const line = stackLines[i];
                if (!__filename_logging || (line.indexOf(__filename_logging) === -1 && line.indexOf('logging.ts') === -1) ) { // Ensure it's not this file
                    const matches = fileMatchRegex.exec(line);
                if (matches && matches[1]) {
                    callerFileName = matches[1];
                    break;
                }
            }
        }
        }
        componentName = callerFileName ? pathUtils.basename(callerFileName, pathUtils.extname(callerFileName)) : 'node-logger';

    } else {
        // Browser environment - could try to get component from URL or a predefined global
        componentName = 'browser-logger';
        if (typeof window !== 'undefined' && window.location && window.location.pathname) {
            const pathParts = window.location.pathname.split('/').filter(p => p);
            if (pathParts.length > 0) {
                componentName = pathParts[pathParts.length -1] || componentName;
            }
    }
}
    return new Logging(componentName);
}


export class Logging {
    component: string;
    appVersion: string;
    private baseMeta: object; // Explicitly object

    constructor(component: string, baseMeta: object = {}, private loggerInstance?: CTLogger) { // Allow CTLogger for setLastId
        this.component = component;
        this.appVersion = isNode
            ? (process.env.APP_VERSION || 'dev')
            : ( (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') ? 'react-native-app' : 'browser-app');
        this.baseMeta = baseMeta;
    }

    private getEffectiveLogger(): CTLogger { // Ensure it returns a CTLogger for setLastId
      return (this.loggerInstance ?? getGlobalLogger()) as CTLogger;
    }

    public getAsLogger = (): Logger => {
        // This facade ensures that the 'this' context is correct for the Logging instance's methods
        return {
            debug: this.debug.bind(this),
            info: this.info.bind(this),
            warn: this.warn.bind(this),
            error: this.error.bind(this),
            log: this.doLog.bind(this),
            getLastId: this.getEffectiveLogger().getLastId.bind(this.getEffectiveLogger()),
            setLastId: this.getEffectiveLogger()?.setLastId,
        } as Logger; // Cast because setLastId is not on Logger interface
    }

    // This method is the one that forms the full LogEntry and passes it to the underlying logger's .log()
    private doLog = (logOpts: Omit<LogEntry, 'timestamp' | 'meta'> & { meta?: object, error?: any }): CTLogger => {
        const logId = uuid.v4().substring(0, 5);
        // Ensure meta passed in logOpts is merged correctly
        const combinedMeta = this.genMeta(logOpts.meta || {});

        const entry: LogEntry = {
            level: logOpts.level,
            message: logOpts.message,
            timestamp: new Date().toISOString(), // Add timestamp here
            meta: {...combinedMeta, logId}, // Add logId to the meta from genMeta
        };
        if (logOpts.error) {
            entry.error = logOpts.error; // Keep error at top level of LogEntry if present
        }

        const logger = this.getEffectiveLogger();
        logger.log(entry); // Call the .log method of the underlying logger

        if (logger.setLastId) { // Check if setLastId exists before calling
            logger.setLastId(logId);
        }

        return logger;
    }

    public info = (message: string, meta: object = {}) => {
        // Directly call the specific method on the logger, which then handles its own formatting (like colors)
        // Or, more consistently, call doLog for unified metadata generation and logId.
        // Let's use doLog for consistency.
        this.doLog({
            level: 'info',
            message,
            meta,
        });
    }

    public debug = (message: string, meta: object = {}, isEnabled: boolean = false) => {
        if (isEnabled) { // Only log if explicitly enabled
            this.doLog({
            level: 'debug',
            message,
                meta,
            });
        }
    }


    public error = (message: string, error: any, meta: object = {}): CTLogger => {
        // `error` object here is the actual Error instance or error-like object
        // `meta.error` will be the structured representation
        const errorMessage = hasOwnProperty(error, 'message') && typeof error.message === 'string'
            ? ` [${error.message}]`
            : (typeof error === 'string' ? ` [${error}]` : '');

        return this.doLog({ // `doLog` returns the logger, so this is fine
            level: 'error',
            message: message + errorMessage,
            error: error, // Pass the raw error object to doLog
            meta: { // This meta is additional to what genMeta provides
                // Structured error details for the 'meta' field
                errorDetails: {
                    name: error?.name,
                    message: error?.message,
                    code: error?.code,
                    stack: error?.stack,
                    // any other custom properties from error you want to log
                },
                ...meta
            }
        });
    }

    public warn = (message: string, meta: object = {}) => {
        this.doLog({
            level: 'warn',
            message,
            meta,
        });
    }

    private genMeta = (obj: object) => ({ // This is for the 'meta' property of the LogEntry
        serverId,
        component: this.component,
        appVersion: this.appVersion,
        // timestamp will be added by doLog or the final logger
        ...this.baseMeta,
        ...obj, // Merges call-specific meta
    })

}
