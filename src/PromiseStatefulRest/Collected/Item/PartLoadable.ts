import { id } from "../../Type"
import { Loadable } from "./Loadable"

/**
 * This is a class for items which have some default initial content (aside from
 * ID).
 *
 * If you don't have _any_ content to fetch after construction, you can just use
 * a plain object instead
 */

export abstract class PartLoadable extends Loadable {
    get states() {
        return {
            "*": async () => ({}),
        }
    }

    /**
     *
     * @param id
     * @param initialContent
     */
    constructor(id: id, initialContent: any) {
        super(id, { "*": initialContent })
    }
}
