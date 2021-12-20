import { Identifiable, id, State } from "../../Type"

/**
 *
 */
type stateLoader = (id: id) => Promise<any>

/**
 * This is an item which has some properties which may be loaded after construction.
 */

export abstract class Loadable implements Identifiable {
    /**
     * This maps internal state names to their values, once lazy-loaded
     */
    private stateMapLazy?: { [stateName: string]: State<any> }

    /**
     * This maps internal state names to their values.
     */
    private get stateMap() {
        if(!this.stateMapLazy) {
            this.stateMapLazy = this.initStateMap()
        }
        return this.stateMapLazy
    }

    /**
     * @returns The new state map to use
     */
    private initStateMap(): { [stateName: string]: State<any> } {
        const stateMap: { [stateKey: string]: State<any> } = {}
        for (const stateName of Object.keys(this.states)) {
            if (stateName in this.initialState) {
                stateMap[stateName] = { value: this.initialState[stateName] }
            } else {
                stateMap[stateName] = {}
            }
        }
        return stateMap
    }

    /**
     * This maps internal state names to their loaders.
     */
    protected abstract readonly states: { [stateKey: string]: stateLoader }

    /**
     *
     * @param stateKey
     * @returns
     */
    protected waitFor(stateKey: string) {
        const state = this.stateMap[stateKey]
        if (state.value !== undefined) {
            return state.value
        } else {
            if (!state.promise) {
                state.promise = (
                    async () => state.value = await this.states[stateKey](this.id)
                )()
            }
            return undefined
        }
    }

    /**
     *
     * @param id
     * @param initialState
     */
    constructor(
        public readonly id: id,
        private readonly initialState: { [stateName: string]: any } = {}
    ) {

    }
}
