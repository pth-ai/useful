import {expect} from "chai";
import {SwitchCaseBuilder, createTypeGuard, hasOwnPropertyPredicate} from "../lib";  // Adjust the import path accordingly

describe('SwitchCaseBuilder', () => {

    // Basic usage
    it('should handle basic type checks using strings', async () => {
        const builder = new SwitchCaseBuilder<{ type: string }>()
            .when('foo', () => 'handled foo')
            .when('bar', () => 'handled bar');

        expect(builder.exec({type: 'foo'})).to.equal('handled foo');
        expect(builder.exec({type: 'bar'})).to.equal('handled bar');
    });

    // Advanced usage with custom type guards
    it('should handle advanced type checks using custom type guards from factory', async () => {
        type Shape = { kind: 'circle', radius: number } | { kind: 'rectangle', width: number, height: number };

        const isCircle = createTypeGuard<Shape>()('kind', 'circle');
        const isRectangle = createTypeGuard<Shape>()('kind', 'rectangle');

        const builder = new SwitchCaseBuilder<Shape>()
            .when(isCircle, shape => `Circle with radius ${shape.radius}`)
            .when(isRectangle, shape => `Rectangle with dimensions ${shape.width}x${shape.height}`)
            .checkExhaustive();

        expect(builder.exec({kind: 'circle', radius: 5})).to.equal('Circle with radius 5');
        expect(builder.exec({kind: 'rectangle', width: 4, height: 6})).to.equal('Rectangle with dimensions 4x6');
    });

    it('should handle using normal TypeScript type predicates', async () => {
        type Circle = { kind: 'circle', radius: number }
        type Rectangle = { kind: 'rectangle', width: number, height: number }
        type Shape = Circle | Rectangle;

        const isCircle = (shape: Shape): shape is Circle => shape.kind === 'circle';
        const isRectangle = (shape: Shape): shape is Rectangle => shape.kind === 'rectangle';

        const builder = new SwitchCaseBuilder<Shape>()
            .when(isCircle, shape => `Circle with radius ${shape.radius}`)
            .when(isRectangle, shape => `Rectangle with dimensions ${shape.width}x${shape.height}`)
            .checkExhaustive();

        expect(builder.exec({kind: 'circle', radius: 5})).to.equal('Circle with radius 5');
        expect(builder.exec({kind: 'rectangle', width: 4, height: 6})).to.equal('Rectangle with dimensions 4x6');
    });

    // Edge cases
    it('should throw an error for unhandled cases', async () => {
        const builder = new SwitchCaseBuilder<{ type: string }>()
            .when('foo', () => 'handled foo');

        expect(builder.exec.bind(builder, {type: 'foo'})).to.not.throw();
        expect(builder.exec.bind(builder, {type: 'bar'})).to.throw("No matching case");
    });

    it('should allow for exhaustive checks', async () => {

        type Testing = { type: 'foo' } | { type: 'bar' };
        const builder = new SwitchCaseBuilder<Testing>()
            .when('foo', () => 'handled foo')
            .when('bar', () => 'handled bar')
            .checkExhaustive();

        expect(builder.exec({type: 'foo'})).to.equal('handled foo');
        expect(builder.exec({type: 'bar'})).to.equal('handled bar');
    });

    it('should handle exact value matches', async () => {
        type CaseOptions = 'case1' | 'case2' | 'case3';

        const builder = new SwitchCaseBuilder<CaseOptions>()
            .when('case1', () => 1)
            .when('case2', () => 2)
            .when('case3', () => 3)
            .checkExhaustive();

        expect(builder.exec('case1')).to.equal(1);
        expect(builder.exec('case2')).to.equal(2);
    });

    it('should handle context correctly', async () => {
        type Context = { prefix: string };

        const builder = new SwitchCaseBuilder<{ type: 'foo' }, Context>()
            .when('foo', (obj, ctx) => `${ctx.prefix} ${obj.type}`);

        expect(builder.exec({type: 'foo'}, {prefix: 'Handled'})).to.equal('Handled foo');
    });

    it('should handle objects with properties created using the property predicate factory', async () => {
        type User =
            { age: number, name: string }
            | { username: string, email: string };

        // Create property predicates
        const hasAge = hasOwnPropertyPredicate('age');
        const hasUsername = hasOwnPropertyPredicate('username');

        // Use the SwitchCaseBuilder with the property predicates
        const builder = new SwitchCaseBuilder<User>()
            .when(hasAge, user => `User with age ${user.age}`)
            .when(hasUsername, user => `User with username ${user.username}`)
            .checkExhaustive();

        // Execute tests
        expect(builder.exec({ age: 25, name: 'John' })).to.equal('User with age 25');
        expect(builder.exec({ username: 'john_doe', email: 'john@example.com' })).to.equal('User with username john_doe');
    });


});
