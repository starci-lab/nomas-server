import { Schema, type } from "@colyseus/schema"

export class InventoryItemColyseusSchema extends Schema {
    @type("string") itemType: string = "" // 'food', 'toy', 'soap', etc.
    @type("string") itemId: string = ""
    @type("string") itemName: string = "" // 'hamburger', 'ball', 'shampoo'
    @type("number") quantity: number = 0
    @type("number") totalPurchased: number = 0 // Track total ever bought
}