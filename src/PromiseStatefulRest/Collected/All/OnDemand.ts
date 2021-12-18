import { Identifiable } from "../../Type"
import { Retained } from "../Retained"

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
 *
 * This differs from Retained in that you can ask for all items.
 */

export abstract class OnDemand<T extends Identifiable> extends Retained<T> {
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
}
