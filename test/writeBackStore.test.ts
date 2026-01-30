import { WriteBackStore } from ".."
import assert from "assert"

// Scenario 3: you have some properties in an existing object which are to be
// stored.

/**
 *
 * @param url
 * @returns
 */
async function fakeFetch(url: string) {
    await new Promise(resolve => setTimeout(resolve, 100))
    return {
        async responseBody() {
            return {
                async json() {
                    return "kg"
                }
            }
        }
    }
}

/**
 *
 */
class Calculator {
    /**
     *
     */
    private unitsCache = new WriteBackStore<string>(
        () => fakeFetch("/get/units")
            .then(r => r.responseBody())
            .then(b => b.json())
    )
    /**
     *
     */
    get result() {
        if(this.units) {
            return this.value + this.units
        } else {
            return null
        }
    }
    /**
     *
     */
    get units() {
        return this.unitsCache.value
    }
    /**
     *
     * @param value
     */
    constructor(private value: number) {

    }

    /**
     *
     * @param n
     */
    add(n: number) {
        this.value += n
    }
}

describe("Example 3 tests", () => {
    it("Can load the wrapper property", async () => {
        const calc = new Calculator(2)
        calc.add(1)
        assert(calc.result === null, "Compound property is initially null")
        await new Promise(resolve => setTimeout(resolve, 150))
        assert(calc.result === "3kg", "Compound property is eventually set")
    })
})