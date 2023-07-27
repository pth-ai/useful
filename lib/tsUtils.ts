import {NonFalsy} from "./tsTypeUtils";

export const delayedPromise = <T>(delayMS: number, action: () => Promise<T>): Promise<T> =>
    new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => {
            clearTimeout(timer);
            try {
                resolve(action());
            } catch (e) {
                reject(e)
            }
        }, delayMS);
    });


const _retryPromise = async <T>(name: string, action: () => Promise<T>, maxRetries: number, attempt: number = 0, ignoreErrors?: (e: any) => boolean): Promise<T> => {
    try {
        return await action()
    } catch (e) {
        if (ignoreErrors && ignoreErrors(e)) {
            throw e;
        } else if (attempt >= maxRetries) {
            console.error(`max retries reached [${name}] error=[${String(e)}] (original error=[${String(e)}])`);
            throw e;
        } else {
            return await delayedPromise(1000 + getRandomInt(300), () => {
                console.debug(`_retryPromise [${name}] retrying..`);
                return _retryPromise(name, action, maxRetries, attempt + 1, ignoreErrors);
            });
        }
    }
};

export const retryPromise = <T>(name: string, action: () => Promise<T>, maxRetries: number, ignoreErrors?: (e: any) => boolean): Promise<T> =>
    _retryPromise(name, action, maxRetries, 0, ignoreErrors);

export const isDefined = <T>(t: T | null | undefined): t is T => t !== null && t !== undefined;

export const truthy = <T, RES>(t: T | null | undefined | false, action: (t: NonNullable<NonFalsy<T>>) => RES | undefined): RES | undefined =>
    (t !== null && t !== undefined && t !== false && action(t as NonNullable<NonFalsy<T>>) || undefined) || undefined;

export const truthies = <T extends {
    [key: string]: NonNullable<NonFalsy<any>> | undefined | null
}, KT extends Extract<keyof T, string>, OUT>(
    t: T | null | undefined | false,
    action: (t: { [K in KT]: NonNullable<NonFalsy<T[K]>> }) => OUT): OUT | undefined =>
    !t || !Object.values(t).every(_ => isDefined(_) && _ !== false) ? undefined : action(t as any as { [K in KT]: NonNullable<NonFalsy<T[K]>> });


export const getRandomInt = (max: number): number => Math.floor(Math.random() * Math.floor(max));

export async function parallelProcessing<T, OUT>(
    list: T[],
    func: (item: T) => Promise<OUT>,
    parallelism: number
): Promise<OUT[]> {
    let result: OUT[] = [];
    for (let i = 0; i < list.length; i += parallelism) {
        const chunk = list.slice(i, i + parallelism);
        const promises = chunk.map(func);
        const res = await Promise.all(promises);
        result = [...result, ...res];
    }
    return result;
}

export interface TypedPromise<T, TErr> extends Promise<T> {
    catch<TResult = T>(onrejected?: ((reason: TErr) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;

    then<TResult1 = T, TResult2 = TypedPromise<never, TErr>>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: TErr) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
}

export const listToMap = <Key extends keyof T, T extends object>(list: T[], key: Key): Map<string, T> => {
    return list.reduce((out, t) => out.set(t[key], t), new Map());
}

export const groupBy = <Key extends keyof T & string, T extends object & { readonly [key in Key]: string | string[] }>(list: T[], key: Key): Map<string, T[]> =>
    list.reduce((out, t) => {
        const tkey = t[key];
        return (typeof tkey === 'string' ? [tkey] : [...tkey]).reduce((_out, k) =>
            _out.set(k, [...(_out.get(k) ?? []), t]), out)
    }, new Map<string, T[]>());

export const tryFunc = async <T, FB = undefined, HE = undefined>(action: () => Promise<T>, fallback?: FB, handleError?: (e: any) => HE): Promise<T | FB | HE | undefined> => {
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

export function assertIsDefined<T>(value: T | null | undefined, errorMsg: string = 'value was not defined'): asserts value is T {
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
