export type NonFalsy<T> = T extends false ? never : T;

export type Not<T, U> = T extends U ? never : T;

export type Resolved<T> = T extends Promise<infer Y> ? Y : T;

export type Singular<T> = T extends (infer Y)[] ? Y : T[];

export type ResolvedObject<T extends object> = { [K in keyof T]: Resolved<T[K]> };

export type RequiredKeyValue<T, K extends keyof T> = T & { [K in keyof T]-?: T[K] };

export interface ServerError<T> {
    name: 'SERVER_ERROR' | string;
    data: T;
    message: string;
}
