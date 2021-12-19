import { Collected, LoadBuffer, Type } from "../.."
import { Book } from "./Book"

/**
 * This is for cases where you cannot know IDs in advance.
 */
export class BatchBookCollection extends Collected.All.Batch<Book> {
    /**
     *
     */
    public static loadBuffer: LoadBuffer<Type.id, Book> | null = null;

    protected readonly delayMs = 10;

    protected get loadBufferStorage() {
        return BatchBookCollection
    }

    protected async loadItems(ids: Type.id[]) {
        // Load & check goes here.
        // Simulates a load delay
        await new Promise(resolve => setTimeout(resolve, 10 + ids.length))
        // Simulated return value
        return new Map(
            ids.map(id => [id, new Book(id, { name: "Test" })])
        )
    }

    protected async loadBatch(filter: any | undefined, options?: any | undefined, cursor?: any) {
        // Load & check goes here.
        // Simulates a load delay
        const ids = [1, 2, 3]
        await new Promise(resolve => setTimeout(resolve, 10 + ids.length))
        // Simulated return value
        return {
            results: ids.map(id => new Book(id, { name: "Test" })),
            cursor: undefined,
        }
    }
}
