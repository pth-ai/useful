export const cc = <T>(i: Immutable<T>): Mutable<T> => {
    return JSON.parse(JSON.stringify(i)) as Mutable<T>;
};

export type Immutable<T> =
    T extends (...args: any[]) => any ? T :
        T extends (infer R)[] ? ReadonlyArray<Immutable<R>> & T :
            T extends object ? {
                readonly [K in keyof T]: Immutable<T[K]>;
            } & T :
                T;

export type Mutable<T> =
    T extends ReadonlyArray<infer R> ? Array<Mutable<R>> :
        T extends object ? {
                -readonly [K in keyof T]: Mutable<T[K]>;
            } :
            T;

/**
 * Edit an immutable object by applying a modification action to a mutable copy of it.
 * Returns a new immutable object after the action has been applied.
 *
 * @param o - The immutable object to modify.
 * @param action - A function that performs modifications on a mutable copy of the object.
 */
export const editImmutable = <T>(o: Immutable<T>, action: (editable: Mutable<T>) => void): Immutable<T> => {
    const copyOfO = asMutableCopy(o);
    action(copyOfO);
    return asImmutable(copyOfO);
};

/**
 * Cast an immutable object to its mutable counterpart.
 *
 * @param t - The immutable object to cast.
 */
export const asMutable = <T>(t: Immutable<T>): Mutable<T> => t as Mutable<T>;

/**
 * Create a mutable copy of an immutable object.
 *
 * @param t - The immutable object to copy.
 */
export const asMutableCopy = <T>(t: Immutable<T>): Mutable<T> => cc(t) as Mutable<T>;

/**
 * Cast a mutable object to its immutable counterpart.
 *
 * @param t - The mutable object to cast.
 */
export const asImmutable = <T>(t: T | Mutable<T>): Immutable<T> => t as Immutable<T>;

/**
 * Convert a Map to its readonly variant.
 *
 * @param m - The Map to convert.
 */
export const toReadOnly = <K, V>(m: Map<K, V>): ReadonlyMap<K, V> => m;

/**
 * Convert a Set to its readonly variant.
 *
 * @param s - The Set to convert.
 */
export const toReadOnlySet = <S>(s: Set<S>): ReadonlySet<S> => s;

/**
 * Create a new ReadonlyMap based on the provided one, but with a new key-value pair added or updated.
 *
 * @param m - The original ReadonlyMap.
 * @param k - The key of the key-value pair to add or update.
 * @param v - The value of the key-value pair to add or update.
 */
export const mapSet = <K, V>(m: ReadonlyMap<K, V>, k: K, v: V): ReadonlyMap<K, V> => {
    return new Map(m).set(k, v);
}

/**
 * Create a new ReadonlyMap based on the provided one, but with a key-value pair removed.
 *
 * @param m - The original ReadonlyMap.
 * @param k - The key of the key-value pair to remove.
 */
export const mapDelete = <K, V>(m: ReadonlyMap<K, V>, k: K): ReadonlyMap<K, V> => {
    const mutableMap = new Map(m);
    mutableMap.delete(k);
    return mutableMap;
}

/**
 * Convert a ReadonlySet to a regular Set.
 *
 * @param s - The ReadonlySet to convert.
 */
export const toMutableSet = <S>(s: ReadonlySet<S>): Set<S> => new Set(s);

/**
 * Create a new ReadonlySet based on the provided one, but with a new value added.
 *
 * @param s - The original ReadonlySet.
 * @param value - The value to add.
 */
export const setAdd = <S>(s: ReadonlySet<S>, value: S): ReadonlySet<S> => {
    return new Set(s).add(value);
}

/**
 * Create a new ReadonlySet based on the provided one, but with a value removed.
 *
 * @param s - The original ReadonlySet.
 * @param value - The value to remove.
 */
export const setDelete = <S>(s: ReadonlySet<S>, value: S): ReadonlySet<S> => {
    const mutableSet = new Set(s);
    mutableSet.delete(value);
    return mutableSet;
}
