# promise-stateful-rest

## Overview

This is a package built to make it easier to work with promises and, more
generally, fetch()-like interfaces, in code which tracks state. In particular,
that means reactive UI frameworks like Vue, React etc.

Simple example:

```js
import { Collected, LoadBuffer, Type } from "promise-stateful-rest"

/**
 * Class which fetches content for `n` books at once
 */
class BatchBookContentHandler extends Collected.Batch {
    /**
     * @type {LoadBuffer<id, T> | null}
     */
    static loadBuffer = null

    delayMs = 100

    loadBufferStorage = BatchBookContentHandler

    async loadItems(ids) {
        const params = new URLSearchParams(
            ids.map(id => ["filter[id][]", id])
        )
        const response = await fetch(`${this.identity}?${params}`)
        const body = await response.responseBody()
        return response.json()
    }

    constructor() {
        super("/book")
    }
}
/**
 * Class which understands how to fetch its content in batch form
 */
class BatchBook {
    /**
     * @type {BatchBookContentHandler}
     */
    static contentHandler = new BatchBookContentHandler()

    /**
     * @type {BatchBookContentHandler}
     */
    contentHandler = BatchBook.contentHandler

    /**
     * @param {number} id
     */
    constructor(id) {
        this.id = id
    }

    get name() {
        return this.contentHandler.get(this.id)?.name
    }
}
const myCollection = new Map(
    [1, 2, 3].map(id => [id, new BatchBook(id)])
)
```

So you have a _loader class_ with some _shared storage_; and an _object class_
which relies on the loader to find its data.
    async loadItems(ids) {
        const params = new URLSearchParams({
            filter: {id: ids},
        })
        const response = await fetch(`${this.identity}?${params}`)
        const body = await response.responseBody()
        return response.json()
    }

    constructor() {
        super("/book")
    }
}
// This supports object-loading in a batch
class BatchBook {
    static contentHandler = new BatchBookContentHandler()

    contentHandler = BatchBook.contentHandler

    constructor(id) {
        this.id = id
    }

    get name() {
        return this.contentHandler.get(this.id)?.name
    }
}
const myCollection = new Map(
    [1, 2, 3].map(id => [id, new BatchBook(id)])
)
```
