export interface InventorySummary {
    totalItems: number
    itemsByType: Record<string, number>
    items: Array<{
        type: string
        id: string
        name: string
        quantity: number
        totalPurchased: number
    }>
}
