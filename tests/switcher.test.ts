import {
    createPrefixTypeGuard, createPrefixTypeValueGuard,
    createTypeGuard,
    hasOwnPropertyPredicate,
    hasOwnPropertyValuePredicate,
    isEitherOfType,
    switcher,
    Switcher
} from "../lib"; // Adjust the import path accordingly

describe('Switcher', () => {

    // Basic usage
    it('should handle basic type checks using strings', async () => {
        const builder = new Switcher<{ type: string }>()
            .when('foo', () => 'handled foo')
            .when('bar', () => 'handled bar');

        expect(builder.exec({type: 'foo'})).toEqual('handled foo');
        expect(builder.exec({type: 'bar'})).toEqual('handled bar');
    });

    // Advanced usage with custom type guards
    it('should handle advanced type checks using custom type guards from factory', async () => {
        type Shape = { kind: 'circle', radius: number } | { kind: 'rectangle', width: number, height: number };

        const isCircle = createTypeGuard<Shape>()('kind', 'circle');
        const isRectangle = createTypeGuard<Shape>()('kind', 'rectangle');

        const builder = new Switcher<Shape>()
            .when(isCircle, shape => `Circle with radius ${shape.radius}`)
            .when(isRectangle, shape => `Rectangle with dimensions ${shape.width}x${shape.height}`)
            .checkExhaustive();

        expect(builder.exec({kind: 'circle', radius: 5})).toEqual('Circle with radius 5');
        expect(builder.exec({kind: 'rectangle', width: 4, height: 6})).toEqual('Rectangle with dimensions 4x6');
    });

    it('should handle using normal TypeScript type predicates', async () => {
        type Circle = { kind: 'circle', radius: number }
        type Rectangle = { kind: 'rectangle', width: number, height: number }
        type Shape = Circle | Rectangle;

        const isCircle = (shape: Shape): shape is Circle => shape.kind === 'circle';
        const isRectangle = (shape: Shape): shape is Rectangle => shape.kind === 'rectangle';

        const builder = new Switcher<Shape>()
            .when(isCircle, shape => `Circle with radius ${shape.radius}`)
            .when(isRectangle, shape => `Rectangle with dimensions ${shape.width}x${shape.height}`)
            .checkExhaustive();

        expect(builder.exec({kind: 'circle', radius: 5})).toEqual('Circle with radius 5');
        expect(builder.exec({kind: 'rectangle', width: 4, height: 6})).toEqual('Rectangle with dimensions 4x6');
    });

    // Edge cases
    it('should throw an error for unhandled cases', async () => {
        const builder = new Switcher<{ type: string }>()
            .when('foo', () => 'handled foo');

        expect(builder.exec.bind(builder, {type: 'foo'})).not.toThrow();
        expect(builder.exec.bind(builder, {type: 'bar'})).toThrow("No matching case");
    });

    it('should allow for exhaustive checks', async () => {

        type Testing = { type: 'foo' } | { type: 'bar' };
        const builder = new Switcher<Testing>()
            .when('foo', () => 'handled foo')
            .when('bar', () => 'handled bar')
            .checkExhaustive();

        expect(builder.exec({type: 'foo'})).toEqual('handled foo');
        expect(builder.exec({type: 'bar'})).toEqual('handled bar');
    });

    it('should handle exact value matches', async () => {
        type CaseOptions = 'case1' | 'case2' | 'case3';

        const builder = new Switcher<CaseOptions>()
            .when('case1', () => 1)
            .when('case2', () => 2)
            .when('case3', () => 3)
            .checkExhaustive();

        expect(builder.exec('case1')).toEqual(1);
        expect(builder.exec('case2')).toEqual(2);
    });

    it('should handle context correctly', async () => {
        type Context = { prefix: string };

        const builder = new Switcher<{ type: 'foo' }, Context>()
            .when('foo', (obj, ctx) => `${ctx.prefix} ${obj.type}`);

        expect(builder.exec({type: 'foo'}, {prefix: 'Handled'})).toEqual('Handled foo');
    });

    it('should handle objects with properties created using the property predicate factory', async () => {
        type User =
            { age: number, name: string }
            | { username: string, email: string };

        // Create property predicates
        const hasAge = hasOwnPropertyPredicate('age');
        const hasUsername = hasOwnPropertyPredicate('username');

        // Use the Switcher with the property predicates
        const builder = new Switcher<User>()
            .when(hasAge, user => `User with age ${user.age}`)
            .when(hasUsername, user => `User with username ${user.username}`)
            .checkExhaustive();

        // Execute tests
        expect(builder.exec({age: 25, name: 'John'})).toEqual('User with age 25');
        expect(builder.exec({username: 'john_doe', email: 'john@example.com'})).toEqual('User with username john_doe');
    });

    it('should handle objects with properties created using the property value predicate factory', async () => {
        type User =
            { atype: 'first', age: number, name: string }
            | { athing: 'second', username: string, email: string }
            | { athingy: 'third', password: string };

        // Create property predicates
        const hasAType = hasOwnPropertyValuePredicate('atype', 'first');
        const hasAThing = hasOwnPropertyValuePredicate('athing', 'second');
        const hasAThingy = hasOwnPropertyValuePredicate('athingy', 'third');

        // Use the Switcher with the property predicates
        const builder = new Switcher<User>()
            .when(hasAType, user => `User with age ${user.age}`)
            .when(hasAThing, user => `User with username ${user.username}`)
            .when(hasAThingy, user => `User with password ${user.password}`)
            .checkExhaustive();

        // Execute tests
        expect(builder.exec({atype: 'first', age: 25, name: 'John'})).toEqual('User with age 25');
        expect(builder.exec({
            athing: 'second',
            username: 'john_doe',
            email: 'john@example.com'
        })).toEqual('User with username john_doe');
        expect(builder.exec({athingy: 'third', password: "1234",})).toEqual('User with password 1234');
    });

    it('should handle objects with properties created using the property value predicate factory 2', async () => {
        type User =
            { atype: 'first', age: number, name: string }
            | { atype: 'second', username: string, email: string }
            | { athingy: 'third', password: string };

        // Create property predicates
        const hasAType = hasOwnPropertyValuePredicate('atype', 'first' as const);
        const hasAThing = hasOwnPropertyValuePredicate('atype', 'second' as const);
        const hasAThingy = hasOwnPropertyValuePredicate('athingy', 'third' as const);

        // Use the Switcher with the property predicates
        const builder = new Switcher<User>()
            .when(hasAType, user => `User with age ${user.age}`)
            .when(hasAThing, user => `User with username ${user.username}`)
            .when(hasAThingy, user => `User with password ${user.password}`)
            .checkExhaustive();

        // Execute tests
        expect(builder.exec({atype: 'first', age: 25, name: 'John'})).toEqual('User with age 25');
        expect(builder.exec({
            atype: 'second',
            username: 'john_doe',
            email: 'john@example.com'
        })).toEqual('User with username john_doe');
        expect(builder.exec({athingy: 'third', password: "1234",})).toEqual('User with password 1234');
    });

    it('should support an either type', async () => {
        type Circle = { type: 'circle' }
        type Square = { type: 'square' }
        type Triangle = { type: 'triangle' }
        type Shape = Circle | Square | Triangle;

        // Create property predicates
        const isCircle = (s: Shape): s is Circle => s.type === 'circle';
        const isSquare = (s: Shape): s is Square => s.type === 'square';
        const isTriangle = (s: Shape): s is Triangle => s.type === 'triangle';

        // Use the Switcher with the property predicates
        const builder = new Switcher<Shape>()
            .when(isCircle, () => `it's a circle!`)
            .when(isEitherOfType(isSquare, isTriangle), () => `It's either a square or a triangle!`)
            .checkExhaustive();

        // Execute tests
        expect(builder.exec({type: 'circle'})).toEqual(`it's a circle!`);
        expect(builder.exec({type: 'square'})).toEqual(`It's either a square or a triangle!`);
        expect(builder.exec({type: 'triangle'})).toEqual(`It's either a square or a triangle!`);
    });

    it('should support the visitor patern using the `create` static method', async () => {

        type User =
            { atype: 'first', age: number, name: string }
            | { atype: 'second', username: string, email: string }
            | { athingy: 'third', password: string };

        // Create property predicates
        const hasAType = hasOwnPropertyValuePredicate('atype', 'first' as const);
        const hasAThing = hasOwnPropertyValuePredicate('atype', 'second' as const);
        const hasAThingy = hasOwnPropertyValuePredicate('athingy', 'third' as const);

        const result = Switcher.create({atype: 'first', age: 25, name: 'John'} as User, switcher =>
            switcher
                .when(hasAType, user => `User with age ${user.age}`)
                .when(hasAThing, user => `User with age ${user.username}`)
                .when(hasAThingy, user => `User with password ${user.password}`)
                .checkExhaustive() // !! use this to make sure it's exhaustive
        )

        // Execute tests
        expect(result).toEqual('User with age 25');
    });

    it('should work with multiple specific values', async () => {

        type Options = 'first' | 'second' | 'third'

        const basicSwitcher = switcher<Options>()
            .when('first', _ => '1')
            .when('second', _ => '2')
            .when('third', _ => '3')
            .checkExhaustive()

        const advancedSwitcher = switcher<Options>()
            .when(['first', 'second'], _ => '1')
            .when('third', _ => '3')
            .checkExhaustive()


        // Execute tests
        expect(basicSwitcher.exec('first')).toEqual('1');
        expect(basicSwitcher.exec('second')).toEqual('2');
        expect(basicSwitcher.exec('third')).toEqual('3');
        expect(advancedSwitcher.exec('first')).toEqual('1');
        expect(advancedSwitcher.exec('second')).toEqual('1');
        expect(advancedSwitcher.exec('third')).toEqual('3');
    })

    it('should allow fallback', async () => {

        type Options = 'first' | 'second' | 'third'

        const basicSwitcher = switcher<Options>()
            .when('first', _ => '1')
            .fallback(_ => '2')
            .checkExhaustive()

        // Execute tests
        expect(basicSwitcher.exec('first')).toEqual('1');
        expect(basicSwitcher.exec('second')).toEqual('2');
        expect(basicSwitcher.exec('third')).toEqual('2');
    });


    it('should allow fallback when using guard', async () => {

        type Options = { name: "first" } | { name: "second" }

        const firstGuard = createTypeGuard<Options>()('name', 'first');

        const basicSwitcher = switcher<Options>()
            .when(firstGuard, _ => '1')
            .fallback(_ => '2')
            .checkExhaustive()

        // Execute tests
        expect(basicSwitcher.exec({name: "first"})).toEqual('1');
        expect(basicSwitcher.exec({name: "second"})).toEqual('2');
    });


    it('should correctly handle a union of prefixed types', async () => {
        // Define a union of type strings
        type MyU = { type: "pref1-type1" } | { type: "pref1-type2" } | { type: "pref2-type" } | { type: "pref3-type" };

        // Create a new Switcher instance for the union type
        const builder = switcher<MyU>()
            .whenTypeStartsWith('pref1', () => 'handled pref1-type1')
            .when('pref2-type', () => 'handled pref2-type')
            .when('pref3-type', () => 'handled pref3-type')
            .checkExhaustive()


        // Execute and assert the outcomes for each type in the union
        expect(builder.exec({type: 'pref1-type1'})).toEqual('handled pref1-type1');
        expect(builder.exec({type: 'pref1-type2'})).toEqual('handled pref1-type1');
        expect(builder.exec({type: 'pref2-type'})).toEqual('handled pref2-type');
        expect(builder.exec({type: 'pref3-type'})).toEqual('handled pref3-type');
    })

    it('should correctly handle a union of prefixed types using guard', async () => {
        // Define a union of type strings
        type MyU = { type: "pref1-type1" } | { type: "pref1-type2" } | { type: "pref2-type" } | { type: "pref3-type" };

        const pref1Prefix = createPrefixTypeGuard<MyU>()('type', 'pref1');

        // Create a new Switcher instance for the union type
        const builder = switcher<MyU>()
            .when(pref1Prefix, () => 'handled pref1 prefixed')
            .when('pref2-type', () => 'handled pref2-type')
            .when('pref3-type', () => 'handled pref3-type')
            .checkExhaustive()


        // Execute and assert the outcomes for each type in the union
        expect(builder.exec({type: 'pref1-type1'})).toEqual('handled pref1 prefixed');
        expect(builder.exec({type: 'pref1-type2'})).toEqual('handled pref1 prefixed');
        expect(builder.exec({type: 'pref2-type'})).toEqual('handled pref2-type');
        expect(builder.exec({type: 'pref3-type'})).toEqual('handled pref3-type');
    });

    it('should correctly handle a union of prefixed types values using guard', async () => {
        // Define a union of type strings
        type MyU = "pref1-type1" | "pref1-type2" | "pref2-type" | "pref3-type";

        const pref1Prefix = createPrefixTypeValueGuard<MyU>()('pref1');

        // Create a new Switcher instance for the union type
        const builder = switcher<MyU>()
            .when(pref1Prefix, () => 'handled pref1 prefixed')
            .when('pref2-type', () => 'handled pref2-type')
            .when('pref3-type', () => 'handled pref3-type')
            .checkExhaustive()

        // Execute and assert the outcomes for each type in the union
        expect(builder.exec('pref1-type1')).toEqual('handled pref1 prefixed');
        expect(builder.exec('pref1-type2')).toEqual('handled pref1 prefixed');
        expect(builder.exec('pref2-type')).toEqual('handled pref2-type');
        expect(builder.exec('pref3-type')).toEqual('handled pref3-type');
    });

});
