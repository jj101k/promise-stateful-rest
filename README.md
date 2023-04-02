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

## Collection Concepts

The below are described in REST terms, but other network protocols or
client-side APIs should be comparable if they use the same kind of concepts.

### Cheap IDs

This is for REST-like systems which can get the IDs of a collection very easily,
but will take a while to get other object content. In general with these you
would fetch all the IDs of the collection in one call, but would then have _n_
calls to fetch the content for several objects.

If a GET on a collection looks something like the below, you probably have cheap
IDs:

```json
{"items":[1,2,3,4,5]}
```

Some of these systems also support fetching a _batch_ of items, since that's
really needed for decent efficiency, but in all cases they should support
directly fetching a single object.

### Expensive IDs

This is for REST-like systems which can get the IDs of a collection, but it
takes a little while. This would include ones which simply have extremely large
or poorly indexed collections, as well as ones will return whole objects for the
collection.

If a GET on a collection looks something like the below, you probably have
expensive IDs:

```json
{"items":[{"id":1,"name":"One","colour":"red"},{"id":2,"name":"Two","colour":"green"},{"id":3,"name":"Three","colour":"blue"}]}
```

These systems are very likely to support filtering and pagination; if yours
doesn't, you won't get much benefit here.

Note: Hybrid systems like JSON:API exist; these have cheap IDs in relationships
only. Most of the time this is equivalent to being cheap overall, but if you
don't have a top-level object for the user you may be able to make it behave
like a cheap-ID system by requesting the IDs only.

## Usage

### Write-back properties

You might have existing objects, in particular UI components, which need
writable stores to work properly but you have an asynchronously-loaded datum to
use with that model.

#### Async init method

In some cases it'll make sense to delay the object looking "valid" at all until
an async-await has loaded your data. If so, you don't have to do anything
special: just `await` your load call in your async init method.

#### Load-on-start

Sometimes you might want to trigger a load immediately but will accept the
object being partly complete until it's done - this might be the case if the
loaded resource provides the main functionality of the object but there is some
kind of other functionality to use before it's loaded. In this case you can try
to make your call in your init method or constructor, using `.then()` to write
the value when the load completes. This can be tricky in terms of dealing with
`undefined` and `null`, so you might want to use load-on-demand below anyway.

#### Load-on-demand

If you want to trigger a load only when something is trying to use the resource,
you can use `WriteBackStore` to produce a value which is undefined until loaded,
something like:

```js
import { WriteBackStore } from "promise-stateful-rest"
class MyExistingClass {
    public myOnDemandProp = new WriteBackStore(
        () => fetch("/some/value")
            .then(r => r.responseBody())
            .then(b => b.json())
    )

    get myOnDemandValue() {
        return this.myOnDemandProp.value
    }
}
```

This provides a thing which is always stored (the `WriteBackStore` itself) as
well as a trigger to use it.

### Cheap IDs

If you've got a system where IDs are cheap to fetch (and other content is not),

#### If you don't have a batch endpoint

You can have your own collection object with the list of IDs, and then fetch the
specific object when explicitly requested, or iteratively do so through the
entire collection. That's perfectly viable, but it means a lot of requests and
correspondingly bad performance.

#### If you have a batch endpoint

If you have a batch endpoint, it will make sense to fetch several items at once;
you only have the challenge of working out which items that should be.

If you really want to, you can pre-calculate that, in which case you can use the
expensive IDs process. The below just deals with implied load demand.

##### Using load-on-demand items only

You can have your own collection object with the list of IDs, and from that emit
objects which know how to do load-on-demand. In effect, this is a loading
collection object, but inside-out.

This works by queueing the ID of the item to be loaded, and once that queue is
stale all of the queued items will be fetched at once.

```js
import { Collected, LoadBuffer, Type } from "promise-stateful-rest"

class BatchBookContentHandler extends Collected.Batch {
    static loadBuffer = null

    delayMs = 100

    get loadBufferStorage() {
        return BatchBookContentHandler
    }

    async loadItems(ids) {
        const params = new URLSearchParams({
            filter: {id: ids},
        })
        const response = await fetch(`${this.identity}?${params}`)
        const body = await response.responseBody()
        return response.json()
    }

    constructor() {
        super("/foo/bar")
    }
}

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
```

##### Adding a Preloaded Collection

In addition to the item class, you can use a collection object which will wrap
the list of IDs. This is just a convenience - if you want to you could
equivalently build a Map by mapping the ID list.

```js
const myCollection = new Map(
    [1, 2, 3].map(id => [id, new BatchBook(id)])
)
for(const book of myCollection.values()) {
    // Do something with book
}
```