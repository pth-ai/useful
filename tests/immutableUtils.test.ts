import {
    asImmutable, asMutable, asMutableCopy, editImmutable,
    mapDelete, mapSet, setAdd, setDelete, toMutableSet, toReadOnly, toReadOnlySet
} from "../lib/immutableUtils";  // Adjust the import path accordingly

describe('ImmutableUtils', () => {

    // Basic usage
    it('should convert object to immutable and back to mutable', async () => {
        const obj = {name: "John", age: 25};
        const immutableObj = asImmutable(obj);
        const mutableObj = asMutable(immutableObj);

        expect(mutableObj).toHaveProperty("name");
        expect(mutableObj.name).toEqual("John");
    });

    it('should modify an immutable object', async () => {
        const obj = asImmutable({name: "John", age: 25});

        const modifiedObj = editImmutable(obj, o => {
            o.name = "Jane";
        });

        expect(modifiedObj).toHaveProperty("name");
        expect(modifiedObj.name).toEqual("Jane");
    });

    // Advanced compilation cases
    it('should handle nested immutable objects', async () => {
        const obj = asImmutable({
            person: {
                name: "John",
                address: {
                    city: "New York"
                }
            }
        });

        const mutableObj = asMutableCopy(obj);
        mutableObj.person.name = "Jane";
        mutableObj.person.address.city = "Los Angeles";

        expect(mutableObj.person).toHaveProperty("name");
        expect(mutableObj.person.name).toEqual("Jane");
        expect(mutableObj.person.address).toHaveProperty("city");
        expect(mutableObj.person.address.city).toEqual("Los Angeles");
    });

    it('should handle ReadonlyMap and ReadonlySet', async () => {
        const map = toReadOnly(new Map().set("key", "value"));
        const set = toReadOnlySet(new Set().add("item"));

        const newMap = mapSet(map, "key", "new value");
        const deletedMap = mapDelete(newMap, "key");

        const newSet = setAdd(set, "new item");
        const deletedSet = setDelete(newSet, "new item");

        expect(newMap.get("key")).toEqual("new value");
        expect(deletedMap.has("key")).toEqual(false);
        expect(newSet.has("new item")).toEqual(true);
        expect(deletedSet.has("new item")).toEqual(false);
    });

    it('should convert ReadonlySet to mutable', async () => {
        const set = toReadOnlySet(new Set().add("item"));
        const mutableSet = toMutableSet(set);

        mutableSet.add("new item");

        expect(mutableSet.has("item")).toEqual(true);
        expect(mutableSet.has("new item")).toEqual(true);
    });

    it('should store and call a function from an immutable object', async () => {
        const sayHello = (name: string) => `Hello, ${name}!`;
        const obj = asImmutable({greet: sayHello});

        const greeting = obj.greet("John");

        expect(greeting).toEqual("Hello, John!");
    });

    it('should iterate over an immutable array', async () => {
        const arr = asImmutable([1, 2, 3, 4, 5]);
        const mutableArray = asMutable(arr);

        let sum = 0;
        for (const num of mutableArray) {
            sum += num;
        }

        expect(sum).toEqual(15);
    });

    it('should handle nested immutable arrays', async () => {
        const matrix = asImmutable([
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ]);
        const mutableMatrix = asMutable(matrix);

        let sum = 0;
        for (const row of mutableMatrix) {
            for (const num of row) {
                sum += num;
            }
        }

        expect(sum).toEqual(45);
    });

    it('should handle mixed nested immutable structures', async () => {
        const data = asImmutable({
            users: [
                {name: "John", age: 25},
                {name: "Jane", age: 28}
            ],
            getNames: function () {
                return this.users.map(user => user.name);
            }
        });

        const names = data.getNames();

        expect(names).toEqual(["John", "Jane"]);
    });

});
