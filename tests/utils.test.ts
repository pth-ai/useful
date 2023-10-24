import {expect} from "chai";
import { isEitherOfType, isNot, Singular, Resolved, ResolvedObject } from "../lib/utils";  // Adjust the import path accordingly

describe('utils', () => {

    // Basic usage for isEitherOfType
    it('should correctly determine if a value matches any of the provided types', async () => {
        const isString = (x: any): x is string => typeof x === 'string';
        const isNumber = (x: any): x is number => typeof x === 'number';

        const isStringOrNumber = isEitherOfType(isString, isNumber);

        expect(isStringOrNumber('hello')).to.equal(true);
        expect(isStringOrNumber(5)).to.equal(true);
        expect(isStringOrNumber(true)).to.equal(false);
    });

    // Basic usage for isNot
    it('should correctly negate the given type predicate', async () => {
        const isString = (val: string | number): val is string => typeof val === 'string';
        const isNotString = isNot(isString);

        expect(isNotString('hello')).to.equal(false);
        expect(isNotString(5)).to.equal(true);
    });

    // Basic usage for Singular type
    it('should correctly extract the individual type from an array type', async () => {
        type TestArray = number[];
        type TestItem = Singular<TestArray>;

        const item: TestItem = 5;
        expect(item).to.equal(5);
    });

    // Basic usage for Resolved type
    it('should correctly resolve the value type of a Promise', async () => {
        type TestPromise = Promise<string>;
        type ResolvedTestPromise = Resolved<TestPromise>;

        const resolvedValue: ResolvedTestPromise = 'hello';
        expect(resolvedValue).to.equal('hello');
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

        expect(obj).to.have.property("name");
        expect(obj).to.have.property("age");
        expect(obj.name).to.equal('John');
        expect(obj.age).to.equal(30);
    });
});
