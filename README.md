# 🛠️ `useful` - A Collection of Handy TypeScript Utilities

![npm](https://img.shields.io/npm/v/useful)
![license](https://img.shields.io/npm/l/useful)
![downloads](https://img.shields.io/npm/dw/useful)

Enhance your TypeScript experience with `useful` - a collection of robust utilities that make your development smoother and more efficient.

## 🌟 Features

- Strongly-typed utilities designed specifically for TypeScript.
- Comprehensive documentation for each utility.
- Built with best practices in mind.
- Continuously updated and maintained.

## 📦 Installation

Using npm:

```bash
npm install useful
```

Or with yarn:

```bash
yarn add useful
```

## 🚀 Utilities

- [SwitchCaseBuilder](#-switchcasebuilder---pattern-matching-and-exhaustive-type-checking-made-easy)
- [immutableUtils](#-immutableutils---tools-for-immutable-and-mutable-operations)

## 🛠️ `SwitchCaseBuilder` - Pattern matching and exhaustive type checking made easy

### 📌 Features:

- **Compile-time Safety**: Ensures that all possible types in a disjoint union are handled, providing strict type checks to eliminate runtime errors.

- **Versatile Type Switching**:
    - Easily handle cases based on the `type` property directly using strings.
    - Use custom type guards for complex type-checking scenarios.
    - Support for predicates to define custom conditions for case handling.

- **Exhaustive Type Checks**: With the `.checkExhaustive()` method, the utility ensures that every possible type in a disjoint union is addressed, preventing potential unhandled cases.

- **Optimized for Disjoint Union Types**: Designed specifically to handle pattern matching for disjoint union types, making it ideal for scenarios where you have distinct type branches.

### 🧪 Usage:

#### Basic Type Matching with Exhaustive Checks

For simple disjoint union types, the `SwitchCaseBuilder` utility offers a straightforward way to handle different variants based on the `type` property. The `.checkExhaustive()` method ensures that every possible type in the union is addressed, offering compile-time safety against unhandled cases.

```typescript
import {SwitchCaseBuilder} from 'useful';

const builder = new SwitchCaseBuilder<{ type: 'foo', fooValue: number } | { type: 'bar', barValue: number }>()
    .when('foo', _ => 'handled foo ' + _.fooValue)
    .when('bar', _ => 'handled bar ' + _.barValue)
    .checkExhaustive(); // will fail to compile if not all options are handled 

console.log(builder.exec({type: 'foo', fooValue: 543}));  // Outputs: "handled foo 543"
console.log(builder.exec({type: 'bar', barValue: 123}));  // Outputs: "handled bar 123"
```

In this example, we define two distinct types within our union, `'foo'` and `'bar'`. The utility provides a clean and type-safe way to handle each variant, ensuring at compile-time that all types are covered.

🚫 Note: `SwitchCaseBuilder` is optimized for disjoint union types like `{ type: 'foo' } | { type: 'bar' }`. Single object types with union properties, e.g., `{ type: 'foo' | 'bar' }`, are not supported. 

## 🛠️ `immutableUtils` - Tools for Immutable and Mutable Operations

The `immutableUtils` module provides a set of utilities to work with immutable and mutable data structures in TypeScript. Handle, convert, and manipulate immutable and mutable data with ease.

### 📌 Features:

- Convert between immutable and mutable objects.
- Perform operations on immutable data structures, returning new immutable structures.
- Type-safe operations ensuring data integrity.

### 🧪 Usage:

#### Convert between Mutable and Immutable

```typescript
import {Immutable, Mutable, asImmutable, asMutable} from 'useful/immutableUtils';

const data: Mutable<{name: string}> = {name: 'John'};
const immutableData: Immutable<typeof data> = asImmutable(data);
const mutableDataAgain: Mutable<typeof immutableData> = asMutable(immutableData);
```

#### Edit an Immutable Object

Using the `editImmutable` function, you can apply modifications to an immutable object and get a new immutable object:

```typescript
import {editImmutable} from 'useful/immutableUtils';

const immutableObj: Immutable<{count: number}> = {count: 0};
const updatedImmutableObj = editImmutable(immutableObj, editableObj => {
    editableObj.count += 1;
});
```

#### Work with ReadonlyMap and ReadonlySet

The `immutableUtils` also provides handy methods to work with `ReadonlyMap` and `ReadonlySet`, allowing you to perform operations while maintaining immutability.

```typescript
import {toReadOnly, mapSet, mapDelete, toReadOnlySet, setAdd, setDelete} from 'useful/immutableUtils';

const roMap: ReadonlyMap<string, number> = toReadOnly(new Map().set('one', 1));
const updatedRoMap = mapSet(roMap, 'two', 2);

const roSet: ReadonlySet<number> = toReadOnlySet(new Set([1, 2, 3]));
const updatedRoSet = setAdd(roSet, 4);
```

For detailed information and more utilities, check the `/docs/immutableUtils.md` file.


### Other Utilities

- Coming soon!

## 📖 Documentation

Detailed documentation for each utility can be found in the `/docs` directory. Some key highlights:

- **SwitchCaseBuilder**: An exhaustive type checker and pattern matcher. Ideal for disjoint union types. [Read more](/docs/switchCaseBuilder.md).
- **immutableUtils**: The `immutableUtils` module provides a robust set of utilities to handle both immutable and mutable data structures in TypeScript, making it easier to perform operations while maintaining data integrity.
  [Read more](/docs/immutableUtils.md).

(Continue with other utilities as they get added.)

## 🌐 Contributing

Contributions are always welcome! Please read our [contributing guide](CONTRIBUTING.md) to get started.

1. Fork the repository.
2. Create a new feature branch.
3. Make your changes.
4. Submit a pull request!

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
