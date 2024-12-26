import SparkMD5 from "spark-md5";
import {getGlobalLogger} from "./logging";


export function hasOwnProperty<X extends object,
    Y extends PropertyKey>(obj: X, prop: Y): obj is Extract<X, Record<Y, unknown>> {
    return obj.hasOwnProperty(prop)
}

type NonFalsy<T> = T extends false ? never : T;

export const truthy = <T, RES>(t: T | null | undefined | false, action: (t: NonNullable<NonFalsy<T>>) => RES | undefined): RES | undefined =>
    (t !== null && t !== undefined && t !== false && action(t as NonNullable<NonFalsy<T>>) || undefined) || undefined;

export const truthies = <T extends {
    [key: string]: NonNullable<NonFalsey<any>> | undefined | null
}, KT extends Extract<keyof T, string>, OUT>(
    t: T | null | undefined | false,
    action: (t: { [K in KT]: NonNullable<NonFalsey<T[K]>> }) => OUT): OUT | undefined =>
    !t || !Object.values(t).every(_ => isDefined(_) && _ !== false) ? undefined : action(t as any as { [K in KT]: NonNullable<NonFalsey<T[K]>> });

export const delayedPromise = <T>(delayMS: number, action: () => Promise<T>): Promise<T> =>
    new Promise<T>((resolve, reject) => {
        const timer = setTimeout(async () => {
            clearTimeout(timer);
            try {
                resolve(await action());
            } catch (e) {
                reject(e)
            }
        }, delayMS);
    });

export const getRandomInt = (max: number): number => Math.floor(Math.random() * Math.floor(max));

const _retryPromise = async <T>(name: string, action: () => Promise<T>, maxRetries: number,
                                attempt: number = 0, ignoreErrors?: (e: any) => boolean,
                                lastFallback?: () => Promise<T>): Promise<T> => {
    try {
        return await action()
    } catch (e) {
        if (ignoreErrors && ignoreErrors(e)) {
            throw e;
        } else if (attempt >= maxRetries) {
            getGlobalLogger().error(`max retries reached [${name}] error=[${String(e)}] (original error=[${String(e)}])`, e, {name});
            throw e;
        } else {
            return await delayedPromise(300 + getRandomInt(300) * (attempt + 1), () => {
                getGlobalLogger().debug(`_retryPromise [${name}] attempt [${attempt}] retrying..`);
                return _retryPromise(name,
                    lastFallback && maxRetries >= attempt + 1 ? lastFallback : action,
                    maxRetries, attempt + 1, ignoreErrors, lastFallback);
            });
        }
    }
};

export const retryPromise = <T>(name: string, action: () => Promise<T>, maxRetries: number,
                                ignoreErrors?: (e: any) => boolean,
                                lastFallback?: () => Promise<T>): Promise<T> =>
    _retryPromise(name, action, maxRetries, 0, ignoreErrors, lastFallback);

export const detailedErrorName = 'DetailedError';

type DetailedError = Error & { meta?: object };
export const isDetailedError = (e: Error): e is DetailedError => e.name === detailedErrorName;

export const throwDetailedError = (error: string, meta?: any): never => {
    const newError = new Error(error) as DetailedError;
    newError.name = detailedErrorName;
    newError.meta = meta;
    throw newError;
};

export const timePromise = <T>(name: string, op: () => Promise<T>): Promise<T> => {
    const startTime = new Date().getTime();
    return op()
        .then(result => {
            const endTime = new Date().getTime();
            getGlobalLogger().debug(`operation [${name}] took [${endTime - startTime}]ms`);
            return result;
        });
};


export const isDefined = <T>(t: T | null | undefined): t is T => t !== null && t !== undefined;
export const isTruthy = <T>(t: T | null | undefined | "" | false): t is T => t !== null && t !== undefined && !!t;

type NonFalsey<T> = T extends false ? never : T;

export type RequiredKeyValue<T, K extends keyof T> = T & { [k in K]-?: T[K] };
export type RequiredKeys<T> = T & { [K in keyof T]-?: T[K] };

export const hasKeyDefinedCurried = <T, K extends string & keyof T>(key: K) => (t: T): t is RequiredKeyValue<T, K> =>
    hasKeyDefined(t, key);

export const hasKeyDefined = <T, K extends string & keyof T>(t: T, key: K): t is RequiredKeyValue<T, K> => {
    return hasOwnProperty(t as Object, key) && t[key] !== null && t[key] !== undefined
}

export const extractError = (err: Error | string | any) =>
    err instanceof Error ? err.message : (typeof err === 'string' ? err : JSON.stringify(err || ''));


export interface TypedPromise<T, TErr> extends Promise<T> {
    catch<TResult = T>(onrejected?: ((reason: TErr) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;

    then<TResult1 = T, TResult2 = TypedPromise<never, TErr>>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: TErr) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
}

export const ifTruthy = <T, OUT>(action: (_: T) => OUT) => (input: T | undefined | null) => input ? action(input) : undefined;

export const keysOf = <T extends object, K extends keyof T & string>(o: T): K[] => Object.keys(o) as K[];

export function assertIsDefined<T>(value: T | null | undefined | void, errorMsg: string = 'value was not defined'): asserts value is T {
    if (value === null || value === undefined) {
        throw Error(errorMsg);
    }
}

export function assertIsTrue(value: boolean, errorMsg: string = 'expected test failed'): asserts value is true {
    if (!value) {
        throw Error(errorMsg);
    }
}

export function assertIsOfType<TUP, T extends TUP>(inT: TUP, predicate: (t: TUP) => t is T, errorMsg: string = 'value type assert failed'): asserts inT is T {
    if (!predicate(inT)) {
        throw Error(errorMsg);
    }
}

export const isServer = typeof window === 'undefined';

export type Creator<T, Extra extends keyof Omit<T, 'id' | 'createdAt' | 'updatedAt'> | never = never> = Omit<T, 'id' | 'createdAt' | 'updatedAt' | Extra>;
export type Updater<T, Extra extends keyof Omit<T, 'id' | 'createdAt' | 'updatedAt'> | never = never> = Omit<T, 'id' | Extra>;

export const listToMap = <Key extends keyof T, T extends object>(list: T[], key: Key): Map<string, T> => {
    return list.reduce((out, t) => out.set(String(t[key]), t), new Map());
}

export const groupBy = <Key extends keyof T & string, T extends object & { readonly [key in Key]: string | string[] }>(list: T[], key: Key): Map<string, T[]> =>
    list.reduce((out, t) => {
        const tkey = t[key];
        return (typeof tkey === 'string' ? [tkey] : [...tkey]).reduce((_out, k) =>
            _out.set(k, [...(_out.get(k) ?? []), t]), out)
    }, new Map<string, T[]>());

export const tryFunc = <T, FB = undefined, HE = undefined>(action: () => T, fallback?: FB, handleError?: (e: any) => HE): T | FB | HE | undefined => {
    try {
        return action()
    } catch (e) {
        if (handleError) {
            return handleError(e)
        } else {
            return fallback ?? undefined;
        }

    }
}

export const tryFuncAsync = async <T, FB = undefined, HE = undefined>(action: () => Promise<T>, fallback?: FB, handleError?: (e: any) => HE): Promise<T | FB | HE | undefined> => {
    try {
        return await action()
    } catch (e) {
        if (handleError) {
            return handleError(e)
        } else {
            return fallback ?? undefined;
        }

    }
}

export function sortObjectKeys(obj: object): any {
    // If it's not an object, return it as is
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    // If it's an array, apply sorting to each element
    if (Array.isArray(obj)) {
        return obj.map(sortObjectKeys);
    }

    // If it's an object, sort its keys and apply sorting to each value
    return keysOf(obj)
        .sort()
        .reduce((acc, key) => {
            acc[key] = sortObjectKeys(obj[key]);
            return acc;
        }, {} as any);
}

export const objectToHashKey = (input: object, full?: boolean) => {
    const objSortedKeys = Array.isArray(input) ? input : sortObjectKeys(input);
    return stringToHashKey(JSON.stringify(objSortedKeys), full)
};

export const stringToHashKey = (input: string, full?: boolean) => {
    return SparkMD5.hash(input).slice(0, full ? undefined : 15);
};

const toBinary = (string: string) => {
    const codeUnits = Uint16Array.from(
        {length: string.length},
        (_element, index) => string.charCodeAt(index)
    );
    const charCodes = new Uint8Array(codeUnits.buffer);

    let result = "";
    charCodes.forEach((char) => {
        result += String.fromCharCode(char);
    });
    return result;
};

export const toBase64 = (input: string) => btoa(toBinary(input));


//> AlphaNum comperator

export function createAlphaNumericalComparator<T>(...properties: (keyof T)[]) {
    return (a: T, b: T): number => {
        for (let property of properties) {
            const aValue: any = a[property];
            const bValue: any = b[property];

            if (aValue !== undefined && bValue !== undefined) {
                const numA = parseInt(aValue.replace(/\D/g, ''), 10);
                const numB = parseInt(bValue.replace(/\D/g, ''), 10);

                const comparison = (!isNaN(numA) && !isNaN(numB))
                    ? (numA - numB) || aValue.localeCompare(bValue)
                    : aValue.localeCompare(bValue);

                if (comparison !== 0) {
                    return comparison;
                }
            }
        }
        return 0;
    };
}

export function zip<T, U>(array1: T[], array2: U[]): [T, U][] {
    const minLength = Math.min(array1.length, array2.length);
    const zippedArray: [T, U][] = [];

    for (let i = 0; i < minLength; i++) {
        zippedArray.push([array1[i], array2[i]]);
    }

    return zippedArray;
}

type ZipToObject<K extends PropertyKey, V> = {
    [key in K]: V;
};

export function zipToObject<K extends PropertyKey, V>(keys: K[], values: V[]): ZipToObject<K, V> {
    const zippedArray = zip(keys, values);
    return Object.fromEntries(zippedArray) as ZipToObject<K, V>;
}

export async function executeInSync<T>(operations: (() => Promise<T>)[]): Promise<T[]> {
    const results: T[] = [];
    for (const operation of operations) {
        const result = await operation();
        results.push(result);
    }
    return results;
}
