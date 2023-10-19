## SwitchCaseBuilder

The `SwitchCaseBuilder` is a utility designed to facilitate type-safe pattern matching in TypeScript. It offers an idiomatic and structured way to handle different types in a disjoint union, providing exhaustive type checks and ensuring that all possible cases are handled.

### Overview

Pattern matching is a common paradigm in functional programming languages. While TypeScript doesn't have native pattern matching, the `SwitchCaseBuilder` utility offers a way to achieve similar functionality, ensuring type safety and exhaustive checks.

### Basic Usage

#### Handling Basic Type Checks

For disjoint union types where you want to handle based on the `type` property:

```typescript
import {SwitchCaseBuilder} from 'useful';

const builder = new SwitchCaseBuilder<{ type: string }>()
    .when('foo', () => 'handled foo')
    .when('bar', () => 'handled bar');

console.log(builder.exec({type: 'foo'}));  // Outputs: "handled foo"
```

### Advanced Usage

#### Using Custom Type Guards

For more complex scenarios, you can use custom type guards:

```typescript
import {SwitchCaseBuilder, createTypeGuard} from 'useful';

type Shape = { kind: 'circle', radius: number } | { kind: 'rectangle', width: number, height: number };

const isCircle = createTypeGuard<Shape>()('kind', 'circle');
const isRectangle = createTypeGuard<Shape>()('kind', 'rectangle');

const builder = new SwitchCaseBuilder<Shape>()
    .when(isCircle, shape => `Circle with radius ${shape.radius}`)
    .when(isRectangle, shape => `Rectangle with dimensions ${shape.width}x${shape.height}`);

console.log(builder.exec({kind: 'circle', radius: 5}));  // Outputs: "Circle with radius 5"
```

### Edge Cases

The `SwitchCaseBuilder` utility throws an error for unhandled cases:

```typescript
const builder = new SwitchCaseBuilder<{ type: string }>()
    .when('foo', () => 'handled foo');

// This will throw an error: "No matching case"
builder.exec({type: 'bar'});
```

#### Ensuring Exhaustive Checks

To ensure that all possible cases in a disjoint union are handled:

```typescript
const builder = new SwitchCaseBuilder<{ type: 'foo' } | { type: 'bar' }>()
    .when('foo', () => 'handled foo')
    .when('bar', () => 'handled bar')
    .checkExhaustive();

console.log(builder.exec({type: 'foo'}));  // Outputs: "handled foo"
```

🚫 **Note**: `SwitchCaseBuilder` is optimized for disjoint union types. Single object types with union properties, e.g., `{ type: 'foo' | 'bar' }`, are not supported.

### Conclusion

The `SwitchCaseBuilder` utility offers a structured and type-safe way to handle pattern matching in TypeScript. It provides a clear and idiomatic approach to handle different types in disjoint unions, ensuring exhaustive type checks and making your TypeScript code more robust.
