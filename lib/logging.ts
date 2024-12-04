import {hasOwnProperty} from "./tsUtils";
import * as uuid from "uuid";
import {switcher} from "./switcher";

// Helper function to determine the environment
const isNode = typeof process !== 'undefined' &&
    process.versions != null &&
    process.versions.node != null;

// Conditional imports and environment-specific code
let __filename: string;
let path: any;

if (isNode) {
    // Node.js environment
    const {fileURLToPath} = await import('url');
    path = await import('path');
    __filename = fileURLToPath(import.meta.url);
} else {
    // Browser environment
    __filename = '';
    path = {
        basename: (path: string, ext?: string) => {
            const parts = path.split('/');
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
}

interface LogEntry {
    level: 'info' | 'debug' | 'error' | 'warm' | string;
    message: string;

    [optionName: string]: any;
}

type CTLogger = Logger & { getLastId: () => string };

export interface Logger {
    debug: (message: string, meta?: object) => void;
    info: (message: string, meta?: object) => void;
    warn: (message: string, meta?: object) => void;
    error: (message: string, error: any, meta?: object) => void;
    log: (entry: LogEntry) => void;
    getLastId: () => string;
    setLastId: (lastId: string) => void;
}

let lastId = "";
const basicLogger: CTLogger = {
    log(entry: LogEntry): void {
        switcher<typeof entry.level>()
            .when('info', () => basicLogger.info(entry.message, entry['meta']))
            .when('debug', () => basicLogger.debug(entry.message, entry['meta']))
            .when('error', () => basicLogger.error(entry.message, entry['error'], entry['meta']))
            .when('warm', () => basicLogger.warn(entry.message, entry['meta']))
            .fallback(() => basicLogger.info(entry.message, entry['meta']))
            .checkExhaustive()
            .exec(entry.level);
    },
    debug(message: string, meta?: object): void {
        console.debug("[DEBUG]", message, meta)
    },
    error(message: string, error: any, meta?: object): void {
        console.error("[ERROR]", message, error, meta)
    },
    info(message: string, meta?: object): void {
        console.info("[INFO]", message, meta);
    },
    warn(message: string, meta?: object): void {
        console.info("[WARN]", message, meta);
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

// Export a logger that delegates to the current global logger.
export const logger: Logger = globalLogger;

const serverId = uuid.v4().substring(0, 5);

export const createLoggerForFile = () => {
    if (isNode) {
        // Node.js specific stack trace handling
        const err = new Error();
        const stack = err.stack || '';

        // Split the stack into lines and find the caller
        const stackLines = stack.split('\n');
        let callerFileName = '';

        // Look for the first occurrence in the stack where a file in this project is mentioned
        for (let i = 2; i < stackLines.length; i++) {
            if (stackLines[i].indexOf(__filename) === -1) {
                // Extract file name using regular expression
                const matches = /at\s+(?:.*?\s+)?(?:\(?(.*?):\d+:\d+\)?)/.exec(stackLines[i]);
                if (matches && matches[1]) {
                    callerFileName = matches[1];
                    break;
                }
            }
        }

        // Return the filename without its extension
        const filename = path.basename(callerFileName, path.extname(callerFileName));
        return new Logging(filename);
    } else {
        // Browser environment - return a default or derived component name
        return new Logging('browser-logger');
    }
}


export class Logging {
    component: string;
    appVersion: string;
    private baseMeta: {};

    constructor(component: string, baseMeta: {} = {}, private logger: Logger = globalLogger) {
        this.component = component;
        this.appVersion = isNode
            ? (process.env.APP_VERSION || 'dev')
            : 'browser';
        this.baseMeta = baseMeta;
    }

    private doLog = (logOpts: LogEntry & { meta: object }): CTLogger => {
        const logId = uuid.v4().substring(0, 5);
        const enhandedMeta = {...logOpts.meta, logId};
        this.logger.log({
            ...logOpts,
            meta: enhandedMeta,
        })
        this.logger.setLastId(logId);

        return this.logger;
    }

    public info = (message: string, meta: object = {}) =>
        logger.log({
            level: 'info',
            message,
            meta: this.genMeta(meta),
        })

    public debug = (message: string, meta: object = {}, isEnabled: boolean = false) =>
        isEnabled && logger.log({
            level: 'debug',
            message,
            meta: this.genMeta(meta)
        })


    public error = (message: string, error: any, meta: object = {}): CTLogger =>
        this.doLog({
            level: 'error',
            message: message + (hasOwnProperty(error, 'message') ? ` [${error.message}]` : ''),
            meta: this.genMeta({
                error: {
                    code: error.code,
                    url: error.url,
                    stack: error.stack
                },
                ...meta
            })
        })

    public warn = (message: string, meta: object = {}) =>
        logger.log({
            level: 'warn',
            message,
            meta: this.genMeta(meta)
        })

    private genMeta = (obj: object) => ({
        serverId,
        component: this.component,
        appVersion: this.appVersion,
        ...this.baseMeta,
        ...obj,
    })

}
