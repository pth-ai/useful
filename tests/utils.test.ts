import {isEitherOfType, isNot, Singular, Resolved, ResolvedObject} from "../lib";
import {objectToHashKey, sortObjectKeys, stringToHashKey} from "../lib";  // Adjust the import path accordingly

describe('utils', () => {

    // Basic usage for isEitherOfType
    it('should correctly determine if a value matches any of the provided types', async () => {
        const isString = (x: any): x is string => typeof x === 'string';
        const isNumber = (x: any): x is number => typeof x === 'number';

        const isStringOrNumber = isEitherOfType(isString, isNumber);

        expect(isStringOrNumber('hello')).toEqual(true);
        expect(isStringOrNumber(5)).toEqual(true);
        expect(isStringOrNumber(true)).toEqual(false);
    });

    // Basic usage for isNot
    it('should correctly negate the given type predicate', async () => {
        const isString = (val: string | number): val is string => typeof val === 'string';
        const isNotString = isNot(isString);

        expect(isNotString('hello')).toEqual(false);
        expect(isNotString(5)).toEqual(true);
    });

    // Basic usage for Singular type
    it('should correctly extract the individual type from an array type', async () => {
        type TestArray = number[];
        type TestItem = Singular<TestArray>;

        const item: TestItem = 5;
        expect(item).toEqual(5);
    });

    // Basic usage for Resolved type
    it('should correctly resolve the value type of a Promise', async () => {
        type TestPromise = Promise<string>;
        type ResolvedTestPromise = Resolved<TestPromise>;

        const resolvedValue: ResolvedTestPromise = 'hello';
        expect(resolvedValue).toEqual('hello');
    });

    // Basic usage for ResolvedObject type
    it('should correctly resolve the properties of an object type', async () => {
        type TestObject = {
            name: Promise<string>,
            age: Promise<number>
        };
        type ResolvedTestObject = ResolvedObject<TestObject>;

        const obj: ResolvedTestObject = {
            name: 'John',
            age: 30
        };

        expect(obj).toHaveProperty("name");
        expect(obj).toHaveProperty("age");
        expect(obj.name).toEqual('John');
        expect(obj.age).toEqual(30);
    });

    describe('sortObjectKeys', () => {
        it('should correctly sort keys of an object', async () => {
            const input = {c: 3, b: 2, a: 1};
            const expected = {a: 1, b: 2, c: 3};
            expect(sortObjectKeys(input)).toEqual(expected);
        });

        it('should correctly sort keys of a nested object', async () => {
            const input = {c: 3, a: 1, b: {d: 4, c: 3}};
            const expected = {a: 1, b: {c: 3, d: 4}, c: 3};
            expect(sortObjectKeys(input)).toEqual(expected);
        });

        it('should handle arrays correctly', async () => {
            const input = {b: [3, 2, 1], a: [1, 3, 2]};
            const expected = {a: [1, 3, 2], b: [3, 2, 1]};
            expect(sortObjectKeys(input)).toEqual(expected);
        });
    });

    describe('objectToHashKey', () => {
        it('should generate consistent hash keys for objects', async () => {
            const obj1 = {a: 1, b: 2};
            const obj2 = {b: 2, a: 1};
            expect(objectToHashKey(obj1)).toEqual(objectToHashKey(obj2));
        });
    });

    describe('stringToHashKey', () => {
        it('should generate a hash key from a string', async () => {
            const input = "test string";
            const hashKey = stringToHashKey(input);
            expect(typeof hashKey).toBe('string');
            // Additional checks can be made based on the expected properties of the hash
        });
    });
});
