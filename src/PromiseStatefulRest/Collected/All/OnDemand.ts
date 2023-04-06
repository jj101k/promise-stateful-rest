import { Batchable } from "batch-tools/dist/src/Batchable"
import { Collected, Identifiable, State, id } from "../../Type"

/**
 * This is whatever you would use as the cursor when performing a collection
 * load in batches. This might be a server process reference, the ID of the last
 * matched item, an offset, etc.
 */

type collectionLoadCursor = string | any

/**
 * This is whatever you would pass in as filter criteria.
 */

type collectionLoadFilter = { [key: string]: any } | { [key: string]: any }[]

/**
 * This is whatever you would use as options to the collection load. This might
 * include page size limits, special headers, etc.
 */

type collectionLoadOptions = any


/**
 * This is for collections where you do not have the ID list in advance, eg.
 * where it's expensive to fetch.
 */

export abstract class OnDemand<T extends Identifiable> implements Collected<T>, Batchable<id, T> {
    /**
     * The backing storage for items which have been seen
     */
    protected items = new Map<string | number, State<T>>()

    /**
     * A many-item loader. This would normally be called recursively until done
     *
     * @param filter
     * @param options
     * @param cursor
     */
    protected abstract loadBatch(filter: collectionLoadFilter | undefined,
        options?: collectionLoadOptions | undefined,
        cursor?: collectionLoadCursor): Promise<{results: T[], cursor: any}>


    /**
     *
     * @param identity This is existing state, often a URL path
     */
    constructor(protected identity: any) {
    }

    abstract abort(): boolean

    /**
     * The item getter. This will immediately return either the named item or
     * undefined, and if it hasn't been loaded yet the load will be started.
     *
     * @param id
     * @returns
     */
    public get(id: id) {
        const item = this.items.get(id)
        if (item === undefined) {
            const newItem: State<T> = {}
            this.items.set(id, newItem)
            newItem.promise = this.include(id).then(
                v => newItem.value = v,
                e => {
                    console.error(e)
                    throw e
                }
            )
            return undefined
        }
        return item.value
    }

    /**
     * The full collection getter. This will fetch (part of) the collection, and
     * will not return until it's all fetched.
     *
     * @param filter
     * @param options
     * @returns a plain array (promised).
     */
    public async getAll(filter?: collectionLoadFilter, options?: collectionLoadOptions) {
        const items: T[] = []
        let cursor: collectionLoadCursor
        do {
            const batchResults = await this.loadBatch(filter, options, cursor)
            items.push(...batchResults.results)
            cursor = batchResults.cursor
        } while (cursor)
        for (const item of items) {
            this.items.set(item.id, { value: item })
        }
        return items
    }

    /**
     * The full collection getter. This will fetch (part of) the collection.
     *
     * @param filter
     * @param options
     * @returns an object you can for-await-of over, allowing you to deal with
     * the results as soon as they come in.
     */
    public async *getAllIterable(filter?: collectionLoadFilter, options?: collectionLoadOptions) {
        let cursor: any
        do {
            const batchResults = await this.loadBatch(filter, options, cursor)
            for (const item of batchResults.results) {
                this.items.set(item.id, { value: item })
                yield item
            }
            cursor = batchResults.cursor
        } while (cursor)
    }

    abstract include(id: id): Promise<T>
}
