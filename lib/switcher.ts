import {Immutable} from "./immutableUtils";
import {TypePredicate} from "./utils";

// Type definition for a predicate function
type TypeObject = { type: string } | string | undefined;

// Utility type to extract the 'type' field values from a type
export type TypeValues<T> = T extends { type: infer U } ? U : never;

export function hasOwnPropertyPredicate<Y extends PropertyKey>(prop: Y) {
    return function <X extends object>(obj: X): obj is Extract<X, Record<Y, unknown>> {
        return obj.hasOwnProperty(prop);
    }
}

export function hasOwnPropertyValuePredicate<Y extends PropertyKey, Z extends any>(prop: Y, value: Z) {
    return function <X extends object>(obj: X): obj is Extract<X, Record<Y, Z>> {
        return hasOwnPropertyPredicate(prop)(obj) && obj[prop] === value;
    }
}


// Utility type to extract the 'type' field values from a type
export type SelectTypeValues<T, U extends string> = T extends { type: U } ? T : never;

/**
 * Function to check if the provided argument has a 'type' property.
 * @param arg - Any argument to be checked.
 * @returns True if the argument has a 'type' property, otherwise false.
 */
function hasTypeProperty(arg: any): arg is TypeObject {
    return typeof arg === 'object' && arg !== null && 'type' in arg;
}

export type PrefixedType<T, P extends string> = T extends `${P}${infer R}` ? `${P}${R}` : never;

/**
 * Utility type to guard values based on a key and its corresponding value type.
 */
export type GuardedValue<T, U extends string> = T extends { [K in keyof T]: U } ? U : never;
type Guard<T, K extends keyof T & string> = (arg: any) => arg is T & Record<K, GuardedValue<T, T[K] & string>>;

// Modify the `createTypeGuard` to work with nested properties
export function createTypeGuard<T>() {
    return <K extends keyof T, V extends T[K]>(prop: K, value: V) => {
        return (obj: T): obj is T & Record<K, V> => obj[prop] === value;
    };
}

/**
 * Creates a runtime type guard function for objects based on a property name and a prefix.
 * The type guard checks if the specified property's value starts with the given prefix.
 *
 * @param prop The property name to check in the object.
 * @param prefix The prefix to check for in the property's value.
 * @returns A type guard function that checks if an object's property value starts with the given prefix.
 */
export function createPrefixTypeGuard<T extends object>() {
    return <K extends keyof T, P extends string>(prop: K, prefix: P) => {
        return (obj: T): obj is T & Record<K, PrefixedType<T[K], P>> => {
            if (typeof obj[prop] === "string") {
                return (obj[prop] as string).startsWith(prefix);
            }
            return false;
        };
    }
}

/**
 * Creates a runtime type guard function for objects based on a property name and a prefix.
 * The type guard checks if the specified property's value starts with the given prefix.
 *
 * @param prop The property name to check in the object.
 * @param prefix The prefix to check for in the property's value.
 * @returns A type guard function that checks if an object's property value starts with the given prefix.
 */
export function createPrefixTypeValueGuard<T extends string>() {
    return <P extends string>(prefix: P) => {
        return (obj: T): obj is T & PrefixedType<T, P> => {
            return obj.startsWith(prefix);
        };
    }
}

type Validated = "validated";
type Unvalidated = "unvalidated";

export const switcher = <T, CTX = undefined>() => new Switcher<T, CTX>()

/**
 * A builder class to create a switch-case like structure for type-safe handling of different cases.
 */
/**
 * Note on Usage with Union Types:
 *
 * The `Switcher` utility is optimized to work with disjoint union types.
 * For example, it supports patterns like `{ type: 'foo' } | { type: 'bar' }`, where each variant
 * is a separate distinct type.
 *
 * However, it does not support single object types with union properties such as `{ type: 'foo' | 'bar' }`.
 * In this case, the `type` property can have multiple values, but the object itself is treated as a single type.
 * For exhaustive checks and pattern matching, we recommend using disjoint union types for clearer
 * and more idiomatic type branching in TypeScript.
 */
export class Switcher<T, CTX = undefined, OUT = never, REMT extends T | {} = T, STATE = Unvalidated> {

    static create<T, OUT>(
        input: T,
        cb: (switcher: Switcher<T, any, never, T, Unvalidated>) => Switcher<T, any, OUT, {}, Validated>
    ): OUT {
        const switcher = new Switcher<T>();
        const configuredSwitcher = cb(switcher);
        return configuredSwitcher.exec(input);
    }

    // Array to hold the cases for the switch-like structure
    private cases: Array<
        {
            type: 'type-predicate',
            predicate: TypePredicate<any> | Guard<any, any>,
            callback: (arg: T, context: Immutable<CTX>) => OUT
        }
        | {
        type: 'func-predicate',
        predicate: (arg: TypeObject) => boolean,
        callback: (arg: T, context: Immutable<CTX>) => OUT
    }> = [];

    /**
     * Add a case to the switch-like structure.
     * Supports multiple overloads for different types of checks.
     */
    /**
     * Define a case based on the 'type' field of an object. This overload will be triggered when
     * the type argument is provided and matches the type field of the object.
     *
     * @param type - The specific type value to match against the object's 'type' field.
     * @param callback - A function to execute if the object's type matches the provided type value.
     * @returns An instance of the `Switcher` with the new case added.
     */
    public when<Type extends TypeValues<REMT>, OUT1>(type: Type, callback: (arg: Extract<REMT, {
        type: Type
    }>, context: Immutable<CTX>) => OUT1): Switcher<T, CTX, OUT | OUT1, Exclude<REMT, {
        type: Type
    }>, Unvalidated>;
    /**
     * Define a case using a custom createTypeGuard factory
     *
     * @param typeGuard - A custom type guard function to determine if the object matches a specific type.
     * @param callback - A function to execute if the object matches the type as determined by the typeGuard.
     * @returns An instance of the `Switcher` with the new case added.
     */
    public when<K extends PropertyKey, V extends any, OUT1, TGV extends Extract<REMT, Record<K, V>>>(typeGuard: ((obj: REMT) => obj is TGV), callback: (arg: TGV, context: Immutable<CTX>) => OUT1): Switcher<T, CTX, OUT | OUT1, Exclude<REMT, TGV>, Unvalidated>;
    /**
     * Define a case using a normal TypeScript type guard
     *
     * @param predicate - A predicate function to determine if the object matches a certain condition.
     * @param callback - A function to execute if the object satisfies the condition set by the predicate.
     * @returns An instance of the `Switcher` with the new case added.
     */
    public when<S extends REMT, OUT1>(predicate: TypePredicate<S>, callback: (arg: Extract<REMT, S>, context: Immutable<CTX>) => OUT1): Switcher<T, CTX, OUT | OUT1, Exclude<REMT, S>, Unvalidated>;
    /**
     * Define a case based on an exact value match.
     *
     * @param value - The exact value to match against the object.
     * @param callback - A function to execute if the object matches the provided value.
     * @returns An instance of the `Switcher` with the new case added.
     */
    public when<Value extends REMT, OUT1>(value: Value, callback: (arg: Value, context: Immutable<CTX>) => OUT1): Switcher<T, CTX, OUT | OUT1, Exclude<REMT, Value>, Unvalidated>;
    /**
     * Define a case based on multiple exact value matches using spread.
     *
     * @param values - An array of values to match against the object.
     * @param callback - A function to execute if the object matches one of the provided values.
     * @returns An instance of the `Switcher` with the new case added.
     */
    public when<Values extends REMT[], OUT1>(values: [...Values], callback: (arg: Values[number], context: Immutable<CTX>) => OUT1): Switcher<T, CTX, OUT | OUT1, Exclude<REMT, Values[number]>, Unvalidated>;
    public when<OUT1>(typeOrPredicate: string | TypePredicate<REMT> | ((obj: REMT) => obj is Extract<REMT, Record<any, any>>) | REMT[], callback: (arg: any, context: any) => any): Switcher<T, CTX, OUT | OUT1, Exclude<REMT, any>, Unvalidated> {
        if (typeof typeOrPredicate === "string") {
            const predicate = (arg: TypeObject) => {
                if (typeof arg === 'string') return arg === typeOrPredicate;
                return !!arg && 'type' in arg && arg.type === typeOrPredicate;
            };
            this.cases.push({type: 'func-predicate', predicate, callback});
        } else if (Array.isArray(typeOrPredicate)) {
            // New check for array of values
            const values = typeOrPredicate;
            const predicate = (arg: any) => values.includes(arg);
            this.cases.push({type: 'func-predicate', predicate, callback});
        } else {
            this.cases.push({type: 'type-predicate', predicate: typeOrPredicate, callback});
        }
        return this as any;
    }

    /**
     * Define a case based on the 'type' field of an object starting with a specific prefix.
     *
     * @param prefix - The prefix to check against the object's 'type' field.
     * @param callback - A function to execute if the object's type starts with the provided prefix.
     * @returns An instance of the `Switcher` with the new case added.
     */
    public whenTypeStartsWith<P extends string, OUT1>(prefix: P, callback: (arg: Extract<REMT, {
        type: PrefixedType<TypeValues<REMT>, P>
    }>, context: Immutable<CTX>) => OUT1): Switcher<T, CTX, OUT | OUT1, Exclude<REMT, {
        type: PrefixedType<TypeValues<REMT>, P>
    }>, Unvalidated> {
        const predicate = (arg: TypeObject): arg is Extract<REMT, { type: PrefixedType<TypeValues<REMT>, P> }> => {
            if (typeof arg === 'string') {
                return arg.startsWith(prefix);
            }
            return !!arg && 'type' in arg && typeof arg.type === 'string' && arg.type.startsWith(prefix);
        };
        this.cases.push({type: 'type-predicate', predicate, callback: callback as any});
        return this as any;
    }

    public fallback<OUT1>(callback: (arg: REMT, context: Immutable<CTX>) => OUT1): Switcher<T, CTX, OUT | OUT1, {}, Validated> {
        this.cases.push({
            type: 'func-predicate',
            predicate: () => true,
            callback: callback as any
        })
        return this as any;
    }


    /**
     * Ensure that all possible cases have been handled.
     */
    public checkExhaustive(this: Switcher<T, CTX, OUT, {} extends REMT ? {} : never, Unvalidated>): Switcher<T, CTX, OUT, {}, Validated>;
    public checkExhaustive(this: Switcher<T, CTX, OUT, any, Unvalidated>): never; // This should cause a compile-time error if there are remaining types
    public checkExhaustive(): any {
        // Runtime implementation does not matter as much here; the type checks are the main goal
        return this;
    }


    /**
     * Execute the switch-like structure.
     * Checks each case against the provided argument.
     */
    // Overload signature for C being undefined
    public exec(this: Switcher<T, undefined, OUT, REMT, STATE>, arg: T): OUT;
    // Overload signature for C not undefined
    public exec(this: Switcher<T, any, OUT, REMT, STATE>, arg: T, context: CTX): OUT;
    // Implementation
    public exec(arg: T, context?: CTX): OUT {
        for (const caseItem of this.cases) {
            if (caseItem.type === 'type-predicate') {
                if (caseItem.predicate(arg)) {
                    return caseItem.callback(arg, context ?? {} as any);
                }
            } else if (caseItem.type === 'func-predicate') {
                if (hasTypeProperty(arg) && caseItem.predicate(arg)) {
                    return caseItem.callback(arg, context ?? {} as any);
                } else if (typeof arg === 'string' && caseItem.predicate(arg)) {
                    return caseItem.callback(arg, context ?? {} as any);
                } else if (typeof arg === 'undefined' && caseItem.predicate(undefined)) {
                    return caseItem.callback(arg, context ?? {} as any);
                } else if (caseItem.predicate(arg as any)) { // Add this case
                    return caseItem.callback(arg, context ?? {} as any);
                }
            }
        }

        throw new Error("No matching case");
    }
}

