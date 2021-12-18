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
     *
     */
    get name(): string {return this.waitFor("*").name}

    /**
     *
     */
    get pages(): string {return this.waitFor("pages")}
}

/**
 * This is for cases where you cannot know IDs in advance.
 */
class BatchBookCollection extends Collected.Iterable.Batch<Book> {
    /**
     *
     */
    public static loadBuffer: LoadBuffer<Type.id, Book> | null = null

    protected readonly delayMs = 100

    protected get loadBufferStorage() {
        return BatchBookCollection
    }

    protected async loadItems(ids: Type.id[]) {
        // Load & check goes here.
        // Simulates a load delay
        await new Promise(resolve => setTimeout(resolve, 10 + ids.length))
        // Simulated return value
        return new Map(
            ids.map(id => [id, new Book(id, {})])
        )
    }

    protected async loadBatch(filter: any | undefined, options?: any | undefined, cursor?: any) {
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