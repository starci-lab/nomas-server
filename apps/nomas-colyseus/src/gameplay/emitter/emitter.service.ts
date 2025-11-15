import { Injectable } from "@nestjs/common"

@Injectable()
export class EmitterService {
    constructor() {}

    public syncResponse<TData = undefined>() {
        //     if (placedItems) {
        //         // take only the placed items that have an id
        //         placedItems = placedItems.filter((placedItem) => placedItem.id)
        //         this.placedItemsGateway.syncPlacedItems({
        //             data: placedItems,
        //             userId: watcherUserId || userId
        //         })
        //     }
        //     if (user) {
        //         // take only the user that has an id
        //         if (user.id) {
        //             this.userGateway.syncUser({
        //                 data: user,
        //                 userId
        //             })
        //         }
        //     }
        //     if (inventories) {
        //         // take only the inventories that have an id
        //         inventories = inventories.filter((inventory) => inventory.id)
        //         this.inventoriesGateway.syncInventories({
        //             data: inventories,
        //             userId
        //         })
        //     }
        //     if (action) {
        //         this.actionGateway.emitAction(action)
        //     }
        // }
        return {
            success: true,
            message: "Sync response successful",
        }
    }
}

// export interface SyncResponseParams<TData = undefined> {
//     userId: string
//     syncedResponse: SyncedResponse<TData>
// }
