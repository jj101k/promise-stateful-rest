import { Batchable } from "batch-tools/dist/src/Batchable"
import { LoadBuffer, LoadBufferPromise } from "../LoadBuffer"
import { Identifiable, id } from "../Type"

/**
 * This is for ad-hoc groups of identically structured items, where you want to
 * batch requests together.
 *
 * This will wait for `delayMs` milliseconds for other items to fetch.
 *
 * This requires that all items are identified individually by the caller.
 */
export abstract class BatchUncached<T extends Identifiable> implements Batchable<id, T> {
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

    /**
     *
     * @param identity This is existing state, often a URL path
     */
    constructor(protected identity: any) {
    }

    async include(id: id): Promise<T> {
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

    abort() {
        return false
    }
}
