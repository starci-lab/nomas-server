import { Module } from "@nestjs/common"
import { PetHandlersModule } from "./pet/pet.module"
import { FoodHandlersModule } from "./food/food.module"
import { InventoryHandlersModule } from "./inventory/inventory.module"
import { PlayerHandlersModule } from "./player/player.module"

@Module({
    imports: [PetHandlersModule, FoodHandlersModule, InventoryHandlersModule, PlayerHandlersModule],
})
export class HandlerModule {}
