import {Immutable} from "./immutableUtils";

// Type definition for a predicate function
type Predicate<T> = (arg: any) => arg is T;
type TypeObject = { type: string } | string;

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


type Validated = "validated";
type Unvalidated = "unvalidated";

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
export class Switcher<T, C = undefined, OUT = never, REMT = T, STATE = Unvalidated> {

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
        { type: 'type-predicate', predicate: Predicate<any> | Guard<any, any>, callback: (arg: T, context: C) => OUT }
        | {
        type: 'func-predicate',
        predicate: (arg: TypeObject) => boolean,
        callback: (arg: T, context: Immutable<C>) => OUT
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
    }>, context: Immutable<C>) => OUT1): Switcher<T, C, OUT | OUT1, Exclude<REMT, {
        type: Type
    }>, Unvalidated>;
    /**
     * Define a case using a custom createTypeGuard factory
     *
     * @param typeGuard - A custom type guard function to determine if the object matches a specific type.
     * @param callback - A function to execute if the object matches the type as determined by the typeGuard.
     * @returns An instance of the `Switcher` with the new case added.
     */
    public when<K extends PropertyKey, V extends any, OUT1, TGV extends Extract<REMT, Record<K, V>>>(typeGuard: ((obj: REMT) => obj is TGV), callback: (arg: TGV, context: Immutable<C>) => OUT1): Switcher<T, C, OUT | OUT1, Exclude<REMT, TGV>, Unvalidated>;
    /**
     * Define a case using a normal TypeScript type guard
     *
     * @param predicate - A predicate function to determine if the object matches a certain condition.
     * @param callback - A function to execute if the object satisfies the condition set by the predicate.
     * @returns An instance of the `Switcher` with the new case added.
     */
    public when<S extends REMT, OUT1>(predicate: Predicate<S>, callback: (arg: Extract<REMT, S>, context: Immutable<C>) => OUT1): Switcher<T, C, OUT | OUT1, Exclude<REMT, S>, Unvalidated>;
    /**
     * Define a case based on an exact value match.
     *
     * @param value - The exact value to match against the object.
     * @param callback - A function to execute if the object matches the provided value.
     * @returns An instance of the `Switcher` with the new case added.
     */
    public when<Value extends REMT, OUT1>(value: Value, callback: (arg: Value, context: Immutable<C>) => OUT1): Switcher<T, C, OUT | OUT1, Exclude<REMT, Value>, Unvalidated>;
    public when<OUT1>(typeOrPredicate: string | Predicate<REMT> | ((obj: REMT) => obj is Extract<REMT, Record<any, any>>), callback: (arg: any, context: any) => any): Switcher<T, C, OUT | OUT1, Exclude<REMT, any>, Unvalidated> {
        if (typeof typeOrPredicate === "string") {
            const predicate = (arg: TypeObject) => {
                if (typeof arg === 'string') return arg === typeOrPredicate;
                return 'type' in arg && arg.type === typeOrPredicate;
            };
            this.cases.push({type: 'func-predicate', predicate, callback});
        } else {
            this.cases.push({type: 'type-predicate', predicate: typeOrPredicate, callback});
        }
        return this as any;
    }

    /**
     * Ensure that all possible cases have been handled.
     */
    public checkExhaustive(this: Switcher<T, C, OUT, {} extends REMT ? {} : never, Unvalidated>): Switcher<T, C, OUT, {}, Validated>;
    public checkExhaustive(this: Switcher<T, C, OUT, any, Unvalidated>): never; // This should cause a compile-time error if there are remaining types
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
    public exec(this: Switcher<T, any, OUT, REMT, STATE>, arg: T, context: C): OUT;
    // Implementation
    public exec(arg: T, context?: C): OUT {
        for (const caseItem of this.cases) {
            if (caseItem.type === 'type-predicate' && caseItem.predicate(arg)) {
                return caseItem.callback(arg, context ?? {} as any);
            } else if (caseItem.type === 'func-predicate' && hasTypeProperty(arg) && caseItem.predicate(arg)) {
                return caseItem.callback(arg, context ?? {} as any);
            } else if (caseItem.type === 'func-predicate' && typeof arg === 'string' && caseItem.predicate(arg)) {
                return caseItem.callback(arg, context ?? {} as any);
            }
        }

        throw new Error("No matching case");
    }
}

