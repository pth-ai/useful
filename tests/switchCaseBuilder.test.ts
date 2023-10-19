import {expect} from "chai";
import {SwitchCaseBuilder, createTypeGuard, TypeValues} from "../lib/switchCaseBuilder";  // Adjust the import path accordingly

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
    it('should handle advanced type checks using custom type guards', async () => {
        type Shape = { kind: 'circle', radius: number } | { kind: 'rectangle', width: number, height: number };

        const isCircle = createTypeGuard<Shape>()('kind', 'circle');
        const isRectangle = createTypeGuard<Shape>()('kind', 'rectangle');

        const builder = new SwitchCaseBuilder<Shape>()
            .when(isCircle, shape => `Circle with radius ${shape.radius}`)
            .when(isRectangle, shape => `Rectangle with dimensions ${shape.width}x${shape.height}`);

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

});
