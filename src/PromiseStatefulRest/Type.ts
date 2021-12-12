export type id = number | string

/**
 * A collection of some kind
 */
export interface Collected<T> {
    /**
     *
     * @param id
     * @returns
     */
    get(id: id): T | undefined
}

/**
 * This is something which can be in a collection
 */
export interface Identifiable {
    /**
     *
     */
    readonly id: id
}

/**
 * This is a lightweight type to express stored state
 */
export interface State<T> {
    promise?: Promise<T>
    value?: T
}