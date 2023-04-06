import { Collected, LoadBuffer, Type } from "promise-stateful-rest"

// Scenario 1: you can quite easily get the list of IDs in a collection

/**
 * @typedef BatchBookContent
 * @property {Type.id} id
 * @property {string} name
 */

/**
 * This is for filling objects which already have IDs.
 *
 * @extends {Collected.BatchUncached<BatchBookContent>}
 */
class BatchBookContentHandler extends Collected.BatchUncached {
    /**
     * @type {LoadBuffer<Type.id, BatchBookContent> | null}
     */
    static loadBuffer = null

    delayMs = 100

    get loadBufferStorage() {
        return BatchBookContentHandler
    }

    async loadItems(ids) {
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
class BatchBook {
    /**
     *
     */
    static contentHandler = new BatchBookContentHandler()

    /**
     *
     */
    static contentHandlerCache = new Collected.Retain(this.contentHandler)

    /**
     *
     */
    contentHandlerCache = BatchBook.contentHandlerCache

    /**
     *
     * @param {Type.id} id
     */
    constructor(id) {
        this.id = id
    }

    /**
     * @type {string | undefined}
     */
    get name() {
        return this.contentHandlerCache.get(this.id)?.name
    }
}

const myCollection = new Map(
    [1, 2, 3].map(id => [id, new BatchBook(id)])
)