import intern from "intern"
import { Collected, LoadBuffer, Type } from ".."
import assert from "assert"

const { registerSuite } = intern.getPlugin("interface.object")

// Scenario 1: you can quite easily get the list of IDs in a collection

interface BatchBookContent {
    id: Type.id
    name: string
}

/**
 * This is for filling objects which already have IDs.
 */
class BatchBookContentHandler extends Collected.Batch<BatchBookContent> {
    public static loadBuffer: LoadBuffer<Type.id, BatchBookContent> | null = null

    protected readonly delayMs = 10

    protected get loadBufferStorage() {
        return BatchBookContentHandler
    }

    protected async loadItems(ids: Type.id[]) {
        // Load & check goes here.
        // Simulates a load delay
        await new Promise(resolve => setTimeout(resolve, 10 + ids.length))
        // Simulated return value
        return new Map(
            ids.map(id => [id, {id, name: "Some Name"}])
        )
    }

    /**
     *
     */
    constructor() {
        super("/foo/bar")
    }
}

/**
 * This is for when you have IDs in advance and can generally fetch a full item
 * in one go.
 */
class BatchBook {
    /**
     *
     */
    private static contentHandler = new BatchBookContentHandler()

    /**
     * Testing: this lets you reset the global state
     */
    public static resetContentHandler() {
        this.contentHandler = new BatchBookContentHandler()
    }

    /**
     *
     */
    private readonly contentHandler = BatchBook.contentHandler

    /**
     *
     * @param id
     */
    constructor(public id: Type.id) {
    }

    /**
     *
     */
    get name(): string | undefined {
        return this.contentHandler.get(this.id)?.name
    }
}

class BookCollection extends Collected.All.Preloaded<BatchBook> {
    protected newItem(id: Type.id) {
        return new BatchBook(id)
    }
}

registerSuite("Example 1 tests", {
    beforeEach: () => {
        BatchBook.resetContentHandler()
    },
    tests: {
        "Can load a book collection without initial items": async () => {
            const collection = new BookCollection()
            const items = await collection.getAll()
            let count = 0
            for(const item of items) {
                count++
            }
            assert(count == 0)
        },
        "Can load a book collection with one initial item (number)": async function() {
            const collection = new BookCollection([42])
            const items = await collection.getAll()
            let count = 0
            for(const item of items) {
                count++
                assert(item.id === 42, "ID matches")
                assert(item.name === undefined, "Name is ininitally undefined")
                await new Promise(resolve => setTimeout(resolve, 40))
                assert(item.name == "Some Name", "After 40ms, name matches")
            }
            assert(count == 1)
        },
        "Can load a book collection with one initial item (string)": async function() {
            const collection = new BookCollection(["42"])
            const items = await collection.getAll()
            let count = 0
            for(const item of items) {
                count++
                assert(item.id === "42", "ID matches")
                assert(item.name === undefined, "Name is ininitally undefined")
                await new Promise(resolve => setTimeout(resolve, 40))
                assert(item.name == "Some Name", "After 40ms, name matches")
            }
            assert(count == 1)
        },
        "Can load a book collection with several items": async function() {
            const collection = new BookCollection(["42", "44", "45"])
            const items = await collection.getAll()
            const seen = new Map<string | number, number>()
            for(const item of items) {
                const t = seen.get(item.id) ?? 0
                seen.set(item.id, t + 1)
                assert(item.name === undefined, "Name is ininitally undefined for " + item.id)
            }
            assert(seen.size == 3, "3 items seen")
            assert(seen.get("42") === 1)
            assert(seen.get("44") === 1)
            assert(seen.get("45") === 1)

            await new Promise(resolve => setTimeout(resolve, 40))
            for(const item of items) {
                assert(item.name == "Some Name", "After 40ms, name matches")
            }
        }
    }
})