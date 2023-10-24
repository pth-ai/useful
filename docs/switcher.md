## Switcher

## Introduction
The `Switcher` class is a utility that provides a way to handle multiple type checks and branches in a type-safe manner. It's inspired by the traditional switch-case mechanism but adds type-safety, exhaustiveness checking, and other powerful features.

## Examples

### Usage with Custom Type Guards
To handle more complex type checks using custom type guards:

```typescript
type Shape = { kind: 'circle', radius: number } | { kind: 'rectangle', width: number, height: number };

const isCircle = createTypeGuard<Shape>()('kind', 'circle');
const isRectangle = createTypeGuard<Shape>()('kind', 'rectangle');

const builder = new Switcher<Shape>()
    .when(isCircle, shape => `Circle with radius ${shape.radius}`)
    .when(isRectangle, shape => `Rectangle with dimensions ${shape.width}x${shape.height}`)
    .checkExhaustive();

console.log(builder.exec({kind: 'circle', radius: 5})); // Outputs: 'Circle with radius 5'
console.log(builder.exec({kind: 'rectangle', width: 4, height: 6})); // Outputs: 'Rectangle with dimensions 4x6'
```

### Using TypeScript Type Predicates
You can also use standard TypeScript type predicates:

```typescript
type Circle = { kind: 'circle', radius: number }
type Rectangle = { kind: 'rectangle', width: number, height: number }
type Shape = Circle | Rectangle;

const isCircle = (shape: Shape): shape is Circle => shape.kind === 'circle';
const isRectangle = (shape: Shape): shape is Rectangle => shape.kind === 'rectangle';

const builder = new Switcher<Shape>()
    .when(isCircle, shape => `Circle with radius ${shape.radius}`)
    .when(isRectangle, shape => `Rectangle with dimensions ${shape.width}x${shape.height}`)
    .checkExhaustive();

console.log(builder.exec({kind: 'circle', radius: 5})); // Outputs: 'Circle with radius 5'
console.log(builder.exec({kind: 'rectangle', width: 4, height: 6})); // Outputs: 'Rectangle with dimensions 4x6'
```

### Exhaustiveness Checks
The Switcher also provides a way to ensure all possible cases have been handled:

```typescript
type Testing = { type: 'foo' } | { type: 'bar' };
const builder = new Switcher<Testing>()
    .when('foo', () => 'handled foo')
    .when('bar', () => 'handled bar')
    .checkExhaustive();

console.log(builder.exec({type: 'foo'})); // Outputs: 'handled foo'
console.log(builder.exec({type: 'bar'})); // Outputs: 'handled bar'
```

### Handling Exact Value Matches
Switcher allows you to handle cases based on exact value matches:

```typescript
type CaseOptions = 'case1' | 'case2' | 'case3';

const builder = new Switcher<CaseOptions>()
    .when('case1', () => 1)
    .when('case2', () => 2)
    .when('case3', () => 3)
    .checkExhaustive();

console.log(builder.exec('case1')); // Outputs: 1
console.log(builder.exec('case2')); // Outputs: 2
```

### Handling Context
Switcher can also handle additional context:

```typescript
type Context = { prefix: string };

const builder = new Switcher<{ type: 'foo' }, Context>()
    .when('foo', (obj, ctx) => `${ctx.prefix} ${obj.type}`);

console.log(builder.exec({type: 'foo'}, {prefix: 'Handled'})); // Outputs: 'Handled foo'
```

### Using Property Predicate Factory
Switcher can handle objects with properties created using property predicate factories:

```typescript
type User =
    { age: number, name: string }
    | { username: string, email: string };

const hasAge = hasOwnPropertyPredicate('age');
const hasUsername = hasOwnPropertyPredicate('username');

const builder = new Switcher<User>()
    .when(hasAge, user => `User with age ${user.age}`)
    .when(hasUsername, user => `User with username ${user.username}`)
    .checkExhaustive();

console.log(builder.exec({ age: 25, name: 'John' })); // Outputs: 'User with age 25'
console.log(builder.exec({ username: 'john_doe', email: 'john@example.com' })); // Outputs: 'User with username john_doe'
```

### Using the `create` Static Method (Visitor Pattern)
For a more declarative style, you can use the `create` static method, which allows you to define your type checks and handlers in a more visitor-like pattern:

```typescript
type User =
    { atype: 'first', age: number, name: string }
    | { atype: 'second', username: string, email: string }
    | { athingy: 'third', password: string };

const hasAType = hasOwnPropertyValuePredicate('atype', 'first' as const);
const hasAThing = hasOwnPropertyValuePredicate('atype', 'second' as const);
const hasAThingy = hasOwnPropertyValuePredicate('athingy', 'third' as const);

const result = Switcher.create({ atype: 'first', age: 25, name: 'John' } as User, switcher =>
    switcher
        .when(hasAType, user => `User with age ${user.age}`)
        .when(hasAThing, user => `User with age ${user.username}`)
        .when(hasAThingy, user => `User with password ${user.password}`)
        .checkExhaustive()
)

console.log(result); // Outputs: 'User with age 25'
```

### Overview

Pattern matching is a common paradigm in functional programming languages. While TypeScript doesn't natively support pattern matching in the same way some functional languages do, the `Switcher` utility bridges this gap. It not only replicates the core functionalities of pattern matching but also adds syntactic sugar to enhance and simplify some common use cases. This allows developers to achieve similar functionality with a touch of elegance, all while ensuring type safety and exhaustive checks.

By leveraging `Switcher`, developers can seamlessly integrate pattern matching into their TypeScript projects, benefiting from both the functional paradigm and the enhanced features the utility provides.

### Why Switcher?

When working with TypeScript, developers often yearn for a more functional approach to handling different cases in their code. The `Switcher` was born out of this necessity, bridging the gap between type safety, functional programming, and pattern matching.

#### Functional Value of Inline Case Matching

Inline case matching is a staple in many functional programming languages, allowing developers to elegantly handle different variants of a type. This pattern not only makes the code more readable but also ensures that the logic for each case is neatly encapsulated, leading to cleaner and more maintainable code.

#### The Limitations of `if/else` and `switch`

Traditional control structures like `if/else` and `switch` come with their own sets of challenges:

- **Compile-Time Checks**: Neither `if/else` nor `switch` offers compile-time checks for covering all possible cases. This can lead to potential runtime errors if a case is missed or overlooked.

- **Functional Closures with Return Compartments**: The `if/else` structure, while versatile, does not naturally encapsulate each branch into a functional closure that returns a value. This can lead to scattered return statements and a lack of clarity on what each branch is producing.

- **Switch's Closure Limitations**: The `switch` statement, on the other hand, groups cases together but doesn't inherently create a returning closure. This means you might end up with multiple `break` statements and scattered returns, making the code harder to follow.

#### Enter Switcher

The `Switcher` utility addresses these challenges by:

- **Ensuring Compile-Time Safety**: With the `.checkExhaustive()` method, the utility ensures that every possible case is addressed, providing a compile-time guarantee against unhandled cases.

- **Functional Encapsulation**: Each case in the `Switcher` is a functional closure that returns a value, ensuring a clear flow and making it evident what each branch produces.

In essence, `Switcher` combines the best of both worlds, offering the structure of traditional control statements with the type safety and functional benefits of modern TypeScript.

🚫 **Note**: `Switcher` is optimized for disjoint union types. Single object types with union properties, e.g., `{ type: 'foo' | 'bar' }`, are not supported.

