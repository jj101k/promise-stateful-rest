import { Collected, LoadBuffer, Type } from "promise-stateful-rest"

// Scenario 1: you can quite easily get the list of IDs in a collection

interface BatchBookContent {
    id: Type.id,
    name: string
}

/**
 * This is for filling objects which already have IDs.
 */
class BatchBookContentHandler extends Collected.Batch<BatchBookContent> {
    public static loadBuffer: LoadBuffer<Type.id, BatchBookContent> | null = null

    protected readonly delayMs = 100

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

class BookCollection extends Collected.Iterable.Preloaded<BatchBook> {
    protected newItem(id: Type.id) {
        return new BatchBook(id)
    }
}