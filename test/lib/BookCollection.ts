import { Collected, Type } from "../.."
import { BatchBook } from "./BatchBook"

export class BookCollection extends Collected.All.Preloaded<BatchBook> {
    protected newItem(id: Type.id) {
        return new BatchBook(id)
    }
}
