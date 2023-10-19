# `immutableUtils` Documentation

The `immutableUtils` module from the `useful` package provides a robust set of utilities to handle both immutable and mutable data structures in TypeScript, making it easier to perform operations while maintaining data integrity.

## Table of Contents

- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
    - [Types](#types)
    - [Functions](#functions)
- [Examples](#examples)

## Core Concepts

Immutable data structures are data structures that cannot be changed once they're created. Any operation that appears to modify them actually returns a new, modified copy. This ensures that data remains consistent and eliminates many common bugs. The `immutableUtils` offers tools to make working with these structures easier.

## API Reference

### Types

#### `Immutable<T>`

A recursive type that makes all properties of a given type `T` readonly.

#### `Mutable<T>`

A recursive type that makes all properties of a given type `T` mutable.

### Functions

#### `cc<T>(i: Immutable<T>): Mutable<T>`

Creates a deep copy of the provided immutable object and returns its mutable counterpart.

#### `editImmutable<T>(o: Immutable<T>, action: (editable: Mutable<T>) => void): Immutable<T>`

Allows you to modify an immutable object by applying a modification action to a mutable copy of it. Returns a new immutable object after the action has been applied.

#### `asMutable<T>(t: Immutable<T>): Mutable<T>`

Casts an immutable object to its mutable counterpart without creating a new object.

#### `asMutableCopy<T>(t: Immutable<T>): Mutable<T>`

Creates a mutable copy of an immutable object.

#### `asImmutable<T>(t: T | Mutable<T>): Immutable<T>`

Casts a mutable object to its immutable counterpart without creating a new object.

#### `toReadOnly<K, V>(m: Map<K, V>): ReadonlyMap<K, V>`

Converts a `Map` to its readonly variant.

#### `toReadOnlySet<S>(s: Set<S>): ReadonlySet<S>`

Converts a `Set` to its readonly variant.

#### `mapSet<K, V>(m: ReadonlyMap<K, V>, k: K, v: V): ReadonlyMap<K, V>`

Creates a new `ReadonlyMap` based on the provided one, but with a new key-value pair added or updated.

#### `mapDelete<K, V>(m: ReadonlyMap<K, V>, k: K): ReadonlyMap<K, V>`

Creates a new `ReadonlyMap` based on the provided one, but with a key-value pair removed.

#### `toMutableSet<S>(s: ReadonlySet<S>): Set<S>`

Converts a `ReadonlySet` to a regular `Set`.

#### `setAdd<S>(s: ReadonlySet<S>, value: S): ReadonlySet<S>`

Creates a new `ReadonlySet` based on the provided one, but with a new value added.

#### `setDelete<S>(s: ReadonlySet<S>, value: S): ReadonlySet<S>`

Creates a new `ReadonlySet` based on the provided one, but with a value removed.

## Examples

### Working with Immutable Objects

```typescript
const data: Immutable<{name: string, age: number}> = {name: 'John', age: 25};
const updatedData = editImmutable(data, editableData => {
    editableData.age += 1;
});
console.log(updatedData.age);  // Outputs: 26
```

### Manipulating ReadonlyMap and ReadonlySet

```typescript
const roMap: ReadonlyMap<string, number> = toReadOnly(new Map().set('one', 1));
const updatedRoMap = mapSet(roMap, 'two', 2);

const roSet: ReadonlySet<number> = toReadOnlySet(new Set([1, 2, 3]));
const updatedRoSet = setAdd(roSet, 4);
```
