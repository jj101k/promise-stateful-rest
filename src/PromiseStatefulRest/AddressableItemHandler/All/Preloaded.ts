import { Collected, id } from "../../Type"

/**
 * This is for collections where you already have the ID list
 */

export abstract class Preloaded<T> implements Collected<T> {
    /**
     *
     */
    private items = new Map<string | number, T>()

    /**
     *
     * @param id
     */
    protected abstract newItem(id: id): T

    /**
     *
     * @param initialItems Already-known
     */
    constructor(initialItems: Array<string | number> = []) {
        for (const id of initialItems) {
            this.items.set(id, this.newItem(id))
        }
    }

    /**
     *
     * @param id
     * @returns
     */
    public get(id: id) {
        return this.items.get(id)
    }

    /**
     *
     * @returns
     */
    public getAll() {
        return this.items.values()
    }
}
