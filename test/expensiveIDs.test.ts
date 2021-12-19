import intern from "intern"
import assert from "assert"
import { Book } from "./Book"
import { BatchBookCollection } from "./BatchBookCollection"
const { registerSuite } = intern.getPlugin("interface.object")

registerSuite("Example 2 tests", {
    "Can load a book collection (iterate)": async () => {
        const collection = new BatchBookCollection("/book")
        const items = collection.getAllIterable()
        const itemsRetained: Book[] = []
        for await (const item of items) {
            assert(item.name == "Test", "name is immediately available")
            assert(item.pages === undefined, "pages is not immediately available")
            itemsRetained.push(item)
        }
        assert(itemsRetained.length == 3)
        await new Promise(resolve => setTimeout(resolve, 50))
        for(const item of itemsRetained) {
            assert(item.pages?.[0]?.match(/Lorem ipsum/), "pages is available after 50ms")
        }
    },
    "Can load a book collection (at-once)": async () => {
        const collection = new BatchBookCollection("/book")
        const itemsRetained = await collection.getAll()
        assert(itemsRetained.length == 3)
        for (const item of itemsRetained) {
            assert(item.name == "Test", "name is immediately available")
            assert(item.pages === undefined, "pages is not immediately available")
        }
        await new Promise(resolve => setTimeout(resolve, 50))
        for(const item of itemsRetained) {
            assert(item.pages?.[0]?.match(/Lorem ipsum/), "pages is available after 50ms")
        }
    },
    "Can load a book": async () => {
        const collection = new BatchBookCollection("/book")
        const itemInitial = await collection.get(1)
        assert(itemInitial === undefined, "Item is initially unset")
        await new Promise(resolve => setTimeout(resolve, 50))
        const item = await collection.get(1)
        assert(item !== undefined, "Item is eventually set")
        assert(item.id == 1, "ID matches")
        assert(item.name == "Test", "name is immediately available")
    },
})