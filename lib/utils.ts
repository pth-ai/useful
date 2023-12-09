// TypePredicate is a type for functions that check if a value is of a specific type.
export type TypePredicate<T> = (arg: any) => arg is T;

// The `isEitherOfType` function accepts a list of type predicates and returns a new predicate
// that checks if a given value matches any of the provided types.
export function isEitherOfType<T extends unknown[]>(...typePredicates: { [K in keyof T]: TypePredicate<T[K]> }): TypePredicate<T[number]> {
    return (value: unknown): value is T[number] => {
        // Iterate over each provided predicate
        for (const predicate of typePredicates) {
            // If the current predicate returns true, the value matches the type
            if (predicate(value)) {
                return true;
            }
        }
        // If none of the predicates match, return false
        return false;
    };
}

// The `isNot` function is a type guard negation utility.
// Given a type predicate, it returns a new predicate that checks for the opposite type.
export const isNot = <T, U>(tPred: (t: T | U) => t is T) =>
    (t: T | U): t is Exclude<U, T> => !tPred(t);

// The `Singular` type takes an array type and extracts its individual item type.
// If given a non-array type, it wraps it in an array.
export type Singular<T> = T extends (infer Y)[] ? Y : T[];

// The `Resolved` type extracts the resolved value type of a Promise.
// If given a non-Promise type, it returns the original type.
export type Resolved<T> = T extends Promise<infer Y> ? Y : T;

// The `ResolvedObject` type maps over the properties of an object type
// and applies the `Resolved` type to each property, effectively resolving any promises.
export type ResolvedObject<T extends object> = { [K in keyof T]: Resolved<T[K]> }
