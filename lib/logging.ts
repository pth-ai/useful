import {hasOwnProperty} from "./tsUtils";
import * as uuid from "uuid";
import {switcher} from "./switcher";

const isNode = typeof process !== 'undefined' &&
    process.versions != null &&
    process.versions.node != null;

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

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

let __filename_logging: string = '';
let pathUtils: any = {
    basename: (path: string, ext?: string) => {
        const parts = path.split(/[/\\]/);
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

const initializeNodeModules = async () => {
    if (isNode) {
        try {
            const [{fileURLToPath}, pathModule] = await Promise.all([
                import('url'),
                import('path')
            ]);
            if (typeof import.meta !== 'undefined' && import.meta.url) {
                __filename_logging = fileURLToPath(import.meta.url);
            } else {
                console.warn('Could not determine __filename_logging using import.meta.url. Caller filename resolution might be affected.');
            }
            pathUtils = pathModule;
        } catch (e) {
            console.warn('Failed to load Node.js specific modules for logging:', e);
        }
    }
};

initializeNodeModules().catch(e => console.error("Error initializing logging node modules:", e));

interface LogEntry {
    level: 'info' | 'debug' | 'error' | 'warn' | string;
    message: string;
    timestamp: string;

    [optionName: string]: any;
}

type CTLogger = Logger & { setLastId?: (lastId: string) => void };

export interface Logger {
    debug: (message: string, meta?: object) => void;
    info: (message: string, meta?: object) => void;
    warn: (message: string, meta?: object) => void;
    error: (message: string, error?: any, meta?: object) => void;
    log: (entry: LogEntry) => void;
    getLastId: () => string;
    setLastId: (lastId: string) => void;
}

let enableGlobalDebug = false;

export function setEnableGlobalDebug(isEnabled: boolean) {
    enableGlobalDebug = isEnabled;
}

let lastId = "";


const basicLogger: Logger = {
    log(entry: LogEntry): void {
        const meta = entry.meta || {};
        switcher<typeof entry.level>()
            .when('info', () => basicLogger.info(entry.message, meta))
            .when('debug', () => basicLogger.debug(entry.message, meta))
            .when('error', () => basicLogger.error(entry.message, entry['error'], meta))
            .when('warn', () => basicLogger.warn(entry.message, meta))
            .fallback(() => basicLogger.info(entry.message, meta))
            .checkExhaustive()
            .exec(entry.level);
    },
    debug(message: string, meta?: object): void {
        const timestamp = new Date().toISOString();
        const stringifiedMeta = meta ? JSON.stringify(meta) : '';
        if (isNode) {
            console.debug(
                colorizeNode(`[${timestamp}]`, TTY_COLORS.FG.GRAY),
                colorizeNode('[DEBUG]', TTY_COLORS.FG.MAGENTA),
                message,
                stringifiedMeta
            );
        } else if (isBrowser) {
            console.debug(
                `%c[${timestamp}] %c[DEBUG]%c ${message}`,
                'color: gray',
                'color: magenta; font-weight: bold;',
                'color: inherit;',
                stringifiedMeta
            );
        } else {
            console.debug(`[${timestamp}] [DEBUG]`, message, stringifiedMeta);
        }
    },
    error(message: string, error?: any, meta?: object): void {
        const timestamp = new Date().toISOString();
        const stringifiedMeta = meta ? JSON.stringify(meta) : '';
        if (isNode) {
            console.error(
                colorizeNode(`[${timestamp}]`, TTY_COLORS.FG.GRAY),
                colorizeNode('[ERROR]', TTY_COLORS.BRIGHT + TTY_COLORS.FG.RED),
                message,
                ...(error ? [error] : []),
                stringifiedMeta
            );
        } else if (isBrowser) {
            console.error(
                `%c[${timestamp}] %c[ERROR]%c ${message}`,
                'color: gray;',
                'color: red; font-weight: bold;',
                'color: inherit;',
                ...(error ? [error] : []),
                stringifiedMeta
            );
        } else {
            console.error(`[${timestamp}] [ERROR]`, message, ...(error ? [error] : []), stringifiedMeta);
        }
    },
    info(message: string, meta?: object): void {
        const timestamp = new Date().toISOString();
        const stringifiedMeta = meta ? JSON.stringify(meta) : '';
        if (isNode) {
            console.info(
                colorizeNode(`[${timestamp}]`, TTY_COLORS.FG.GRAY),
                colorizeNode('[INFO]', TTY_COLORS.FG.GREEN),
                message,
                stringifiedMeta
            );
        } else if (isBrowser) {
            console.info(
                `%c[${timestamp}] %c[INFO]%c ${message}`,
                'color: gray;',
                'color: green; font-weight: bold;',
                'color: inherit;',
                stringifiedMeta
            );
        } else {
            console.info(`[${timestamp}] [INFO]`, message, stringifiedMeta);
        }
    },
    warn(message: string, meta?: object): void {
        const timestamp = new Date().toISOString();
        const stringifiedMeta = meta ? JSON.stringify(meta) : '';
        if (isNode) {
            console.warn(
                colorizeNode(`[${timestamp}]`, TTY_COLORS.FG.GRAY),
                colorizeNode('[WARN]', TTY_COLORS.BRIGHT + TTY_COLORS.FG.YELLOW),
                message,
                stringifiedMeta
            );
        } else if (isBrowser) {
            console.warn(
                `%c[${timestamp}] %c[WARN]%c ${message}`,
                'color: gray;',
                'color: orange; font-weight: bold;',
                'color: inherit;',
                stringifiedMeta
            );
        } else {
            console.warn(`[${timestamp}] [WARN]`, message, stringifiedMeta);
        }
    },
    setLastId(lastIdToSet: string): void {
        lastId = lastIdToSet;
    },
    getLastId(): string {
        return lastId;
    }
};

export interface Transport extends Logger {

}


let transports: Transport[] = [basicLogger];

export function addTransport(t: Transport) {
    transports.push(t);
}

export function clearTransports() {
    transports = [];
}

export function getTransports(): Readonly<Transport[]> {
    return transports;
}

let globalLogger: Logger = basicLogger;

export const setLogger = (newLogger: Logger) => {
    globalLogger = newLogger;
};

export const getGlobalLogger = (): Logger => globalLogger;

const serverId = uuid.v4().substring(0, 5);

export const createLoggerForFile = (sourceFileUrl?: string) => {
    let componentName = 'unknown-source';
    if (isNode) {
        let callerFileName = '';
        if (sourceFileUrl) {
            try {
                callerFileName = new URL(sourceFileUrl).pathname;
            } catch (e) {
                callerFileName = sourceFileUrl;
            }
        } else {
            const err = new Error();
            const stack = err.stack || '';
            const stackLines = stack.split('\n');

            // Look for the first line in the stack that is NOT this logging file.
            // Regex to capture file path:
            // - (?:(?:file|https?):[/]{2,3}[^/]+)? -> Optional scheme and host for file URLs or http URLs
            // - ([\w\-. /\\:]+?\.(?:js|ts|mjs|cjs)) -> Capture path ending with common JS/TS extensions
            // - :\d+:\d+ -> Line and column number
            const fileMatchRegex = /(?:at\s+(?:.*?)\s+\()?(?:(?:file|https?):[/]{2,3}[^/]+)?([\w\-. /\\:]+?\.(?:js|ts|mjs|cjs)):\d+:\d+\)?/i;

            for (let i = 1; i < stackLines.length; i++) {
                const line = stackLines[i];
                if (!__filename_logging || (line.indexOf(__filename_logging) === -1 && line.indexOf('logging.ts') === -1)) {
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
        componentName = 'browser-logger';
        if (typeof window !== 'undefined' && window.location && window.location.pathname) {
            const pathParts = window.location.pathname.split('/').filter(p => p);
            if (pathParts.length > 0) {
                componentName = pathParts[pathParts.length - 1] || componentName;
            }
        }
    }
    return new Logging(componentName);
}


export type MetaProvider = () => Record<string, unknown>;
let globalMetaProvider: MetaProvider | undefined;

export function setLoggingMetaProvider(provider?: MetaProvider) {
    globalMetaProvider = provider;
}

function prune<T extends Record<string, unknown>>(obj: T): T {
    return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

export class Logging {
    component: string;
    appVersion: string;
    private baseMeta: object;

    constructor(component: string, baseMeta: object = {}, private loggerInstance?: CTLogger) {
        this.component = component;
        this.appVersion = isNode
            ? (process.env.APP_VERSION || 'dev')
            : ((typeof navigator !== 'undefined' && navigator.product === 'ReactNative') ? 'react-native-app' : 'browser-app');
        this.baseMeta = baseMeta;
    }

    private getEffectiveLogger(): CTLogger {
        return (this.loggerInstance ?? getGlobalLogger()) as CTLogger;
    }

    public getAsLogger = (): Logger => {
        return {
            debug: this.debug.bind(this),
            info: this.info.bind(this),
            warn: this.warn.bind(this),
            error: this.error.bind(this),
            log: this.doLog.bind(this),
            getLastId: this.getEffectiveLogger().getLastId.bind(this.getEffectiveLogger()),
            setLastId: this.getEffectiveLogger()?.setLastId,
        } as Logger;
    }

    private doLog = (logOpts: Omit<LogEntry, 'timestamp' | 'meta'> & { meta?: object, error?: any }): CTLogger => {
        const logId = uuid.v4().substring(0, 5);
        const combinedMeta = this.genMeta(logOpts.meta || {});

        const entry: LogEntry = {
            level: logOpts.level,
            message: logOpts.message,
            timestamp: new Date().toISOString(),
            meta: {...combinedMeta, logId},
        };
        if (logOpts.error) {
            entry.error = logOpts.error;
        }

        try {

            for (const t of transports) {
                t.log(entry);
                t.setLastId(logId)
            }


        } catch (e: any) {
            if ((e.message ?? "").includes("write after end")) {
                // ignore
            } else {
                throw new Error("error in logger", {cause: e})
            }
        }

        return transports[0];

    }

    public info = (message: string, meta: object = {}) => {
        this.doLog({
            level: 'info',
            message,
            meta,
        });
    }

    public debug = (message: string, meta: object = {}, isEnabled: boolean = false) => {
        if (enableGlobalDebug || isEnabled) {
            this.doLog({
                level: 'debug',
                message,
                meta,
            });
        }
    }


    public error = (message: string, error: any, meta: object = {}): CTLogger => {
        const errorMessage = hasOwnProperty(error, 'message') && typeof error.message === 'string'
            ? ` [${error.message}]`
            : (typeof error === 'string' ? ` [${error}]` : '');

        return this.doLog({
            level: 'error',
            message: message + errorMessage,
            error: error,
            meta: {
                errorDetails: {
                    name: error?.name,
                    message: error?.message,
                    code: error?.code,
                    stack: error?.stack,
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

    public with(extra: Record<string, unknown>) {
        return new Logging(this.component, {...this.baseMeta, ...extra}, this.getEffectiveLogger());
    }

    private genMeta = (obj: object) => prune({
        ...(globalMetaProvider ? globalMetaProvider() : {}),
        serverId,
        pid: process.pid,
        component: this.component,
        appVersion: this.appVersion,
        ...this.baseMeta,
        ...obj,
    })

}
