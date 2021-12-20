import { Collected, LoadBuffer, Type } from "promise-stateful-rest"

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
     * @type {string}
     */
    get name() {return this.waitFor("*").name}

    /**
     * @type {string}
     */
    get pages() {return this.waitFor("pages")}
}

/**
 * This is for cases where you cannot know IDs in advance.
 *
 * @extends {Collected.All.Batch<Book>}
 */
class BatchBookCollection extends Collected.All.Batch {
    /**
     * @type {LoadBuffer<Type.id, Book> | null}
     */
    static loadBuffer = null

    delayMs = 100

    get loadBufferStorage() {
        return BatchBookCollection
    }

    async loadItems(ids) {
        // Load & check goes here.
        // Simulates a load delay
        await new Promise(resolve => setTimeout(resolve, 10 + ids.length))
        // Simulated return value
        return new Map(
            ids.map(id => [id, new Book(id, {})])
        )
    }

    async loadBatch(filter, options = undefined, cursor = undefined) {
        // Load & check goes here.
        // Simulates a load delay
        const ids=[1,2,3]
        await new Promise(resolve => setTimeout(resolve, 10 + ids.length))
        // Simulated return value
        return {
            results: ids.map(id => new Book(id, {})),
            cursor: undefined,
        }
    }
}