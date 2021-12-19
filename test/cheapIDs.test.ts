import intern from "intern"
import assert from "assert"
import { BatchBook } from "./lib/BatchBook"
import { BookCollection } from "./lib/BookCollection"

const { registerSuite } = intern.getPlugin("interface.object")

// Scenario 1: you can quite easily get the list of IDs in a collection

registerSuite("Example 1 tests", {
    beforeEach: () => {
        BatchBook.resetContentHandler()
    },
    tests: {
        "Can load a book collection without initial items": async () => {
            const collection = new BookCollection()
            const items = await collection.getAll()
            let count = 0
            for(const item of items) {
                count++
            }
            assert(count == 0)
        },
        "Can load a book collection with one initial item (number)": async function() {
            const collection = new BookCollection([42])
            const items = await collection.getAll()
            let count = 0
            for(const item of items) {
                count++
                assert(item.id === 42, "ID matches")
                assert(item.name === undefined, "Name is ininitally undefined")
                await new Promise(resolve => setTimeout(resolve, 40))
                assert(item.name == "Some Name", "After 40ms, name matches")
            }
            assert(count == 1)
        },
        "Can load a book collection with one initial item (string)": async function() {
            const collection = new BookCollection(["42"])
            const items = await collection.getAll()
            let count = 0
            for(const item of items) {
                count++
                assert(item.id === "42", "ID matches")
                assert(item.name === undefined, "Name is ininitally undefined")
                await new Promise(resolve => setTimeout(resolve, 40))
                assert(item.name == "Some Name", "After 40ms, name matches")
            }
            assert(count == 1)
        },
        "Can load a book collection with several items": async function() {
            const collection = new BookCollection(["42", "44", "45"])
            const items = await collection.getAll()
            const seen = new Map<string | number, number>()
            for(const item of items) {
                const t = seen.get(item.id) ?? 0
                seen.set(item.id, t + 1)
                assert(item.name === undefined, "Name is ininitally undefined for " + item.id)
            }
            assert(seen.size == 3, "3 items seen")
            assert(seen.get("42") === 1)
            assert(seen.get("44") === 1)
            assert(seen.get("45") === 1)

            await new Promise(resolve => setTimeout(resolve, 40))
            for(const item of items) {
                assert(item.name == "Some Name", "After 40ms, name matches")
            }
        },
        "Can load a book": async () => {
            const collection = new BookCollection([1, 2, 3])
            const item = await collection.get(1)
            assert(item !== undefined, "Item is initially set")
            assert(item.id == 1, "ID matches")
            assert(item.name === undefined, "Name is ininitally undefined for " + item.id)
            await new Promise(resolve => setTimeout(resolve, 50))
            assert(item.name == "Some Name", "name is eventually available")
        },
    }
})