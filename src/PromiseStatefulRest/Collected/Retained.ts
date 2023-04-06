import { Batchable } from "batch-tools/dist/src/Batchable"
import { Collected, Identifiable, id, State } from "../Type"

/**
 * This is for collections where you do not have the ID list in advance, eg.
 * where it's expensive to fetch.
 *
 * Loaded objects are retained in the collection, and must be explicitly
 * requested.
 */

export abstract class Retained<T extends Identifiable> implements Collected<T>, Batchable<id, T> {
    /**
     * The backing storage for items which have been seen
     */
    protected items = new Map<string | number, State<T>>()

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

    abstract include(id: id): Promise<T>
}
