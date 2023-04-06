import { Collected, LoadBuffer, Type } from "../.."

export interface BatchBookContent {
    id: Type.id
    name: string
}

/**
 * This is for filling objects which already have IDs.
 */
export class BatchBookContentHandler extends Collected.BatchUncached<BatchBookContent> {
    public static loadBuffer: LoadBuffer<Type.id, BatchBookContent> | null = null;

    protected readonly delayMs = 10;

    protected get loadBufferStorage() {
        return BatchBookContentHandler
    }

    protected async loadItems(ids: Type.id[]) {
        // Load & check goes here.
        // Simulates a load delay
        await new Promise(resolve => setTimeout(resolve, 10 + ids.length))

        // Simulated return value
        return new Map(
            ids.map(id => [id, { id, name: "Some Name" }])
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
export class BatchBook {
    private static readonly contentHandler = new BatchBookContentHandler()
    /**
     *
     */
    private static contentHandlerCache = new Collected.Retain(this.contentHandler)

    /**
     * Testing: this lets you reset the global state
     */
    public static resetContentHandlerCache() {
        this.contentHandlerCache = new Collected.Retain(this.contentHandler)
    }

    /**
     *
     */
    private readonly contentHandlerCache = BatchBook.contentHandlerCache

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
        return this.contentHandlerCache.get(this.id)?.name
    }
}
