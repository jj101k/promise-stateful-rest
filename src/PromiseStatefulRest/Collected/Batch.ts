import { Identifiable, id } from "../Type"
import { LoadBuffer, LoadBufferPromise } from "../LoadBuffer"
import { Retained } from "./Retained"

/**
 * This is for ad-hoc groups of identical items, where you want to batch
 * requests together.
 *
 * This will wait for `delayMs` milliseconds for other items to fetch.
 *
 * This requires that all items are identified individually by the caller.
 */

export abstract class Batch<T extends Identifiable> extends Retained<T> {
    /**
     * The time to wait
     */
    protected readonly delayMs: number = 50

    /**
     * This is the shared entity which includes a load buffer, often the class
     * itself (in a static sense). This will be null when there are no pending
     * loads, and a LoadBuffer otherwise.
     */
    protected abstract readonly loadBufferStorage: {
        loadBuffer: LoadBuffer<id, T> | null
    }

    /**
     * The batch loader. This is called when the queued searches are committed.
     *
     * @param ids
     */
    protected abstract loadItems(ids: id[]): LoadBufferPromise<id, T>

    protected async loadItem(id: id): Promise<T> {
        if (!this.loadBufferStorage.loadBuffer) {
            this.loadBufferStorage.loadBuffer = new LoadBuffer<id, T>(
                async (toLoad: id[]) => {
                    this.loadBufferStorage.loadBuffer = null

                    return await this.loadItems(toLoad)
                },
                this.delayMs
            )
        }
        const items = await this.loadBufferStorage.loadBuffer.push(id)
        const item = items.get(id)
        if (!item) {
            throw new Error(`Item with ID ${id} was not found`)
        }
        return item
    }


}
