import { Collected, Identifiable, id, State } from "../Type"

/**
 * This is for collections where you do not have the ID list in advance, eg.
 * where it's expensive to fetch.
 *
 * Loaded objects are retained in the collection, and must be explicitly
 * requested.
 */

export abstract class Retained<T extends Identifiable> implements Collected<T> {
    /**
     * The backing storage for items which have been seen
     */
    protected items = new Map<string | number, State<T>>()

    /**
     * A single-item loader. This just promises at some point to return the
     * requested item.
     *
     * @param id
     */
    protected abstract loadItem(id: id): Promise<T>

    /**
     *
     * @param identity This is existing state, often a URL path
     */
    constructor(protected identity: any) {
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
            newItem.promise = this.loadItem(id).then(
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
}
