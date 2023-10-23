## SwitchCaseBuilder

The `SwitchCaseBuilder` is a utility designed to facilitate type-safe pattern matching in TypeScript. It offers an idiomatic and structured way to handle different types in a disjoint union, providing exhaustive type checks and ensuring that all possible cases are handled.

### Overview

Pattern matching is a common paradigm in functional programming languages. While TypeScript doesn't natively support pattern matching in the same way some functional languages do, the `SwitchCaseBuilder` utility bridges this gap. It not only replicates the core functionalities of pattern matching but also adds syntactic sugar to enhance and simplify some common use cases. This allows developers to achieve similar functionality with a touch of elegance, all while ensuring type safety and exhaustive checks.

By leveraging `SwitchCaseBuilder`, developers can seamlessly integrate pattern matching into their TypeScript projects, benefiting from both the functional paradigm and the enhanced features the utility provides.

### Why SwitchCaseBuilder?

When working with TypeScript, developers often yearn for a more functional approach to handling different cases in their code. The `SwitchCaseBuilder` was born out of this necessity, bridging the gap between type safety, functional programming, and pattern matching.

#### Functional Value of Inline Case Matching

Inline case matching is a staple in many functional programming languages, allowing developers to elegantly handle different variants of a type. This pattern not only makes the code more readable but also ensures that the logic for each case is neatly encapsulated, leading to cleaner and more maintainable code.

#### The Limitations of `if/else` and `switch`

Traditional control structures like `if/else` and `switch` come with their own sets of challenges:

- **Compile-Time Checks**: Neither `if/else` nor `switch` offers compile-time checks for covering all possible cases. This can lead to potential runtime errors if a case is missed or overlooked.

- **Functional Closures with Return Compartments**: The `if/else` structure, while versatile, does not naturally encapsulate each branch into a functional closure that returns a value. This can lead to scattered return statements and a lack of clarity on what each branch is producing.

- **Switch's Closure Limitations**: The `switch` statement, on the other hand, groups cases together but doesn't inherently create a returning closure. This means you might end up with multiple `break` statements and scattered returns, making the code harder to follow.

#### Enter SwitchCaseBuilder

The `SwitchCaseBuilder` utility addresses these challenges by:

- **Ensuring Compile-Time Safety**: With the `.checkExhaustive()` method, the utility ensures that every possible case is addressed, providing a compile-time guarantee against unhandled cases.

- **Functional Encapsulation**: Each case in the `SwitchCaseBuilder` is a functional closure that returns a value, ensuring a clear flow and making it evident what each branch produces.

In essence, `SwitchCaseBuilder` combines the best of both worlds, offering the structure of traditional control statements with the type safety and functional benefits of modern TypeScript.


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
