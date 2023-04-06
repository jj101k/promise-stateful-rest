import { Batchable } from "batch-tools/dist/src/Batchable"
import { Collected, Identifiable, State, id } from "../Type"

/**
 * A cache wrapper around a batch object
 */
export class Retain<T extends Identifiable> implements Collected<T>, Batchable<id, T> {
    /**
     * The backing storage for items which have been seen
     */
    protected items = new Map<string | number, State<T>>()

    /**
     *
     * @param handler
     */
    constructor(private readonly handler: Batchable<id, T>) {
    }

    abort() {
        return this.handler.abort()
    }

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
     * This just passes through to the underlying handler, so can be used if you
     * emphatically do not want caching.
     */
    include(id: id): Promise<T> {
        return this.handler.include(id)
    }
}