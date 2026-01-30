import assert from "assert"
import { Book } from "./lib/Book"
import { BatchBookCollection } from "./lib/BatchBookCollection"

const delayMs = 50

describe("Example 2 tests", () => {
    it("Can load a book collection (iterate)", async () => {
        const collection = new BatchBookCollection("/book")
        const items = collection.getAllIterable()
        const itemsRetained: Book[] = []
        for await (const item of items) {
            assert(item.name == "Test", "name is immediately available")
            assert(item.pages === undefined, "pages is not immediately available")
            itemsRetained.push(item)
        }
        assert(itemsRetained.length == 3)
        await new Promise(resolve => setTimeout(resolve, delayMs))
        for(const item of itemsRetained) {
            assert(item.pages?.[0]?.match(/Lorem ipsum/), "pages is eventually available")
        }
    })
    it("Can load a book collection (at-once)", async () => {
        const collection = new BatchBookCollection("/book")
        const itemsRetained = await collection.getAll()
        assert(itemsRetained.length == 3)
        for (const item of itemsRetained) {
            assert(item.name == "Test", "name is immediately available")
            assert(item.pages === undefined, "pages is not immediately available")
        }
        await new Promise(resolve => setTimeout(resolve, delayMs))
        for(const item of itemsRetained) {
            assert(item.pages?.[0]?.match(/Lorem ipsum/), "pages is eventually available")
        }
    })
    it("Can load a book", async () => {
        const collection = new BatchBookCollection("/book")
        const itemInitial = await collection.get(1)
        assert(itemInitial === undefined, "Item is initially unset")
        await new Promise(resolve => setTimeout(resolve, delayMs))
        const item = await collection.get(1)
        assert(item !== undefined, "Item is eventually set")
        assert(item.id == 1, "ID matches")
        assert(item.name == "Test", "name is immediately available")
    })
})