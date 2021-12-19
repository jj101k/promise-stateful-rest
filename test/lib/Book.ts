import { Collected } from "../.."

// Scenario 2: where you cannot know IDs in advance, you generally fetch whole
// objects at once
/**
 *
 */
export class Book extends Collected.Item.PartLoadable {
    get states() {
        return {
            ...super.states,
            "pages": async () => ["Page 1\nLorem ipsum dolor sit amet..."],
        }
    }

    /**
     *
     */
    get name(): string | undefined { return this.waitFor("*").name }

    /**
     *
     */
    get pages(): string | undefined { return this.waitFor("pages") }
}
