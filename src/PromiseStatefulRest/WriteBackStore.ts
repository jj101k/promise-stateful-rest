/**
 * This class wraps a value which must be loaded async but must be written back,
 * where there's no support for that on the class.
 *
 * In a class, you might declare:
 *
 *  public myOnDemandProp = new WriteBackStore<number>(
 *      () => fetch("/some/value")
 *          .then(r => r.responseBody())
 *          .then(b => b.json())
 *  )
 *
 * Then myClass.myOnDemandProp.value will initially be undefined, and later be
 * whatever the value is.
 *
 * You might well want to add a shortcut for convenience:
 *
 *  get myOnDemandValue() {
 *      return this.myOnDemandProp.value
 *  }
 */
export class WriteBackStore<T> {
    /**
     * The on-demand mechanism to load the data. This will be nulled once used.
     */
    private loader: (() => Promise<T>) | null

    /**
     * This is the underlying store.
     */
    private result: {content?: T} | null = null

    /**
     *
     * @param loader
     */
    constructor(loader: () => Promise<T>) {
        this.loader = loader
    }

    /**
     * The main public entry point. This will run the loader if needed, and
     * otherwise return the underlying value.
     */
    get value(): T | undefined {
        if(this.result) {
            return this.result.content
        } else if(this.loader) {
            this.loader().then(
                content => this.result = {content},
                () => this.result = {}
            )
            this.loader = null
        }
        return undefined
    }
}
