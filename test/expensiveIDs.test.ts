import { Collected, LoadBuffer, Type } from ".."
import assert from "assert"

// Scenario 2: where you cannot know IDs in advance, you generally fetch whole
// objects at once

/**
 *
 */
class Book extends Collected.Item.PartLoadable {
    get states() {
        return {
            ...super.states,
            "pages": async () => ["Page 1\nLorem ipsum dolor sit amet..."],
        }
    }

    /**
     *
     */
    get name(): string | undefined {return this.waitFor("*").name}

    /**
     *
     */
    get pages(): string | undefined {return this.waitFor("pages")}
}

/**
 * This is for cases where you cannot know IDs in advance.
 */
class BatchBookCollection extends Collected.Iterable.Batch<Book> {
    /**
     *
     */
    public static loadBuffer: LoadBuffer<Type.id, Book> | null = null

    protected readonly delayMs = 10

    protected get loadBufferStorage() {
        return BatchBookCollection
    }

    protected async loadItems(ids: Type.id[]) {
        // Load & check goes here.
        // Simulates a load delay
        await new Promise(resolve => setTimeout(resolve, 10 + ids.length))
        // Simulated return value
        return new Map(
            ids.map(id => [id, new Book(id, {name: "Test"})])
        )
    }

    protected async loadBatch(filter: any | undefined, options?: any | undefined, cursor?: any) {
        // Load & check goes here.
        // Simulates a load delay
        const ids = [1, 2, 3]
        await new Promise(resolve => setTimeout(resolve, 10 + ids.length))
        // Simulated return value
        return {
            results: ids.map(id => new Book(id, {name: "Test"})),
            cursor: undefined,
        }
    }
}


describe("Example 2 tests", function() {
    this.slow(300)
    it("Can load a book collection (iterate)", async () => {
        const collection = new BatchBookCollection("/book")
        const items = collection.getAllIterable()
        const itemsRetained: Book[] = []
        for await (const item of items) {
            assert(item.name == "Test", "name is immediately available")
            assert(item.pages === undefined, "pages is not immediately available")
            itemsRetained.push(item)
        }
        assert(itemsRetained.length == 3)
        await new Promise(resolve => setTimeout(resolve, 50))
        for(const item of itemsRetained) {
            assert(item.pages?.[0]?.match(/Lorem ipsum/), "pages is available after 50ms")
        }
    })
    it("Can load a book collection (at-once)", async () => {
        const collection = new BatchBookCollection("/book")
        const itemsRetained = await collection.getAll()
        assert(itemsRetained.length == 3)
        for (const item of itemsRetained) {
            assert(item.name == "Test", "name is immediately available")
            assert(item.pages === undefined, "pages is not immediately available")
        }
        await new Promise(resolve => setTimeout(resolve, 50))
        for(const item of itemsRetained) {
            assert(item.pages?.[0]?.match(/Lorem ipsum/), "pages is available after 50ms")
        }
    })
})