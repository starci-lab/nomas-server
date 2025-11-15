import { Client } from "colyseus"
import { RetryService } from "@modules/mixin"
import { GameRoomState, Pet, Player } from "@modules/colyseus/schemas"
import { GamePetMessages, GameFoodMessages, GamePetEvent, GameFoodEvent } from "@modules/gameplay"
import { PetService } from "@apps/nomas-colyseus/src/gameplay/handlers/pet/pet.message-handlers"
import { FoodMessageHandlers } from "@apps/nomas-colyseus/src/gameplay/handlers/food/food.message-handlers"
import { InventoryMessageHandlers } from "@apps/nomas-colyseus/src/gameplay/handlers/inventory/inventory.message-handlers"
import { PlayerMessageHandlers } from "@apps/nomas-colyseus/src/gameplay/handlers/player/player.message-handlers"
import { BaseRoom } from "./base.room"
import { OnMessage, EmitMessage } from "../decorators"
import { GameInventoryEvent } from "@modules/gameplay/inventory"
import { GamePlayerEvent, GamePlayerMessages } from "@modules/gameplay"

const ROOM_CONFIG = {
    maxClients: 4,
    updateInterval: 1000,
    reconnectionTime: 60,
}

interface GameRoomOptions {
    name?: string
    addressWallet?: string
}

// Message types
interface BuyPetMessage {
    petType?: string
    petTypeId?: string
    isBuyPet?: boolean
}

interface RemovePetMessage {
    petId?: string
}

interface FeedPetMessage {
    petId?: string
    foodType?: string
}

interface PlayPetMessage {
    petId?: string
}

interface FoodConsumedMessage {
    pet_id?: string
    hunger_level?: number
}

interface PlayedPetMessage {
    pet_id?: string
    happiness_level?: number
}

interface CreatePoopMessage {
    petId?: string
    positionX?: number
    positionY?: number
}

export class GameRoom extends BaseRoom<GameRoomState> {
    private retryService: RetryService | null = null
    private lastStatePersistedAt = 0
    private petMessages: PetService | null = null
    private foodMessages: FoodMessageHandlers | null = null
    private inventoryMessages: InventoryMessageHandlers | null = null
    private playerMessages: PlayerMessageHandlers | null = null

    maxClients = ROOM_CONFIG.maxClients

    async onCreate(options: GameRoomOptions) {
        this.initializeDependencies()
        this.initializeRoom(options)
        this.registerDecoratedHandlers() // Register decorated handlers
        this.startSimulationLoop()
        await this.bootstrapRoomWithRetry()
    }

    async onJoin(client: Client, options: GameRoomOptions) {
        const player = new Player()
        player.sessionId = client.sessionId
        player.name = options?.name || `Player_${client.sessionId.slice(0, 5)}`
        player.walletAddress = options?.addressWallet || ""

        this.state.players.set(client.sessionId, player)
        this.state.playerCount = this.state.players.size

        this.syncPlayerPets(player)
        this.sendWelcomeMessage(client, player)
        this.logger.debug(
            `👋 Player joined: ${player.name} (${client.sessionId}). Total players: ${this.state.playerCount}`,
        )
    }

    onLeave(client: Client, consented?: boolean) {
        const player = this.state.players.get(client.sessionId)
        if (!player) {
            return
        }

        this.cleanupPlayerPets(client.sessionId)
        this.state.players.delete(client.sessionId)
        this.state.playerCount = this.state.players.size

        this.logger.debug(`👋 Player left: ${player.name} (${client.sessionId}). consented=${consented}`)
        this.allowReconnection(client, ROOM_CONFIG.reconnectionTime)
    }

    onDispose() {
        this.logger.debug("🧹 Disposing GameRoom", this.roomId)
    }

    private initializeDependencies() {
        this.retryService = this.app.get(RetryService, { strict: false })
        this.petMessages = this.app.get(PetService, { strict: false })
        this.foodMessages = this.app.get(FoodMessageHandlers, { strict: false })
        this.inventoryMessages = this.app.get(InventoryMessageHandlers, { strict: false })
        this.playerMessages = this.app.get(PlayerMessageHandlers, { strict: false })
    }

    private initializeRoom(options: GameRoomOptions) {
        this.setState(new GameRoomState())
        this.state.roomName = options?.name || "Pet Simulator Room"
        this.logger.debug(`🏠 GameRoom created (${this.roomId})`)
    }

    // Basic room message handlers
    @OnMessage("request_state")
    private handleRequestState(client: Client) {
        this.sendStateSnapshot(client)
    }

    @OnMessage("update_player_name")
    private handleUpdatePlayerName(client: Client, message: { name?: string }) {
        const player = this.state.players.get(client.sessionId)
        if (!player || !message?.name) {
            return
        }
        player.name = message.name
    }

    // Pet message handlers với decorators
    @OnMessage(GamePetMessages.BUY_PET)
    @EmitMessage(GamePetEvent.BuyRequested)
    private handleBuyPet(client: Client, data: BuyPetMessage = {}) {
        if (!this.petMessages) {
            return null
        }
        return this.petMessages.buyPet(this)(client, data)
    }

    @OnMessage(GamePetMessages.REMOVE_PET)
    @EmitMessage(GamePetEvent.RemoveRequested)
    private handleRemovePet(client: Client, data: RemovePetMessage = {}) {
        if (!this.petMessages) {
            return null
        }
        return this.petMessages.removePet(this)(client, data)
    }

    @OnMessage(GamePetMessages.FEED_PET)
    @EmitMessage(GamePetEvent.FeedRequested)
    private handleFeedPet(client: Client, data: FeedPetMessage = {}) {
        if (!this.petMessages) {
            return null
        }
        return this.petMessages.feedPet(this)(client, data)
    }

    @OnMessage(GamePetMessages.PLAY_WITH_PET)
    @EmitMessage(GamePetEvent.PlayRequested)
    private handlePlayWithPet(client: Client, data: PlayPetMessage = {}) {
        if (!this.petMessages) {
            return null
        }
        return this.petMessages.playWithPet(this)(client, data)
    }

    @OnMessage(GamePetMessages.CLEANED_PET)
    @EmitMessage(GamePetEvent.CleanRequested)
    private handleCleanedPet(client: Client, data: { petId?: string; cleaningItemId?: string; poopId?: string } = {}) {
        if (!this.petMessages) {
            return null
        }
        return this.petMessages.cleanedPet(this)(client, data)
    }

    @OnMessage(GamePetMessages.PLAYED_PET)
    @EmitMessage(GamePetEvent.Played)
    private handlePlayedPet(client: Client, data: PlayedPetMessage = {}) {
        if (!this.petMessages) {
            return null
        }
        return this.petMessages.playedPet(this)(client, data)
    }

    @OnMessage(GamePetMessages.FOOD_CONSUMED)
    @EmitMessage(GamePetEvent.FoodConsumed)
    private handleFoodConsumed(client: Client, data: FoodConsumedMessage = {}) {
        if (!this.petMessages) {
            return null
        }
        return this.petMessages.foodConsumed(this)(client, data)
    }

    @OnMessage(GamePetMessages.CREATE_POOP)
    @EmitMessage(GamePetEvent.PoopCreated)
    private handleCreatePoop(client: Client, data: CreatePoopMessage = {}) {
        if (!this.petMessages) {
            return null
        }
        return this.petMessages.createPoop(this)(client, data)
    }

    // Food message handlers
    @OnMessage(GameFoodMessages.BUY_FOOD)
    @EmitMessage(GameFoodEvent.PurchaseRequested)
    private handleBuyFood(
        client: Client,
        data: { itemId?: string; itemType?: string; itemName?: string; quantity?: number } = {},
    ) {
        if (!this.foodMessages) {
            return null
        }
        return this.foodMessages.purchaseItem(this)(client, data)
    }

    @OnMessage(GameFoodMessages.GET_CATALOG)
    @EmitMessage(GameFoodEvent.GetCatalogRequested)
    private handleGetCatalog(client: Client) {
        if (!this.foodMessages) {
            return null
        }
        return this.foodMessages.getCatalog(this)(client)
    }

    @OnMessage(GameFoodMessages.GET_INVENTORY)
    @EmitMessage(GameFoodEvent.GetInventoryRequested)
    private handleGetFoodInventory(client: Client) {
        if (!this.foodMessages) {
            return null
        }
        return this.foodMessages.getInventory(this)(client)
    }

    @OnMessage(GameFoodMessages.FEED_PET)
    @EmitMessage(GameFoodEvent.FeedPetRequested)
    private handleFeedPetWithFood(client: Client, data: { petId?: string; foodType?: string; quantity?: number } = {}) {
        if (!this.foodMessages) {
            return null
        }
        return this.foodMessages.feedPet(this)(client, data)
    }

    // Inventory message handlers
    @OnMessage("get_inventory")
    @EmitMessage(GameInventoryEvent.GetInventoryRequested)
    private handleGetInventory(client: Client) {
        if (!this.inventoryMessages) {
            return null
        }
        return this.inventoryMessages.getInventory(this)(client)
    }

    // Player message handlers
    @OnMessage(GamePlayerMessages.REQUEST_GAME_CONFIG)
    @EmitMessage(GamePlayerEvent.GetGameConfigRequested)
    private handleRequestGameConfig(client: Client) {
        if (!this.playerMessages) {
            return null
        }
        return this.playerMessages.requestGameConfig(this)(client)
    }

    @OnMessage(GamePlayerMessages.REQUEST_PLAYER_STATE)
    @EmitMessage(GamePlayerEvent.GetPlayerStateRequested)
    private handleRequestPlayerState(client: Client) {
        if (!this.playerMessages) {
            return null
        }
        return this.playerMessages.requestPlayerState(this)(client)
    }

    @OnMessage(GamePlayerMessages.GET_PROFILE)
    @EmitMessage(GamePlayerEvent.GetProfileRequested)
    private handleGetProfile(client: Client) {
        if (!this.playerMessages) {
            return null
        }
        return this.playerMessages.getProfile(this)(client)
    }

    @OnMessage(GamePlayerMessages.REQUEST_PETS_STATE)
    @EmitMessage(GamePlayerEvent.GetPetsStateRequested)
    private handleRequestPetsState(client: Client, data: unknown = {}) {
        if (!this.playerMessages) {
            return null
        }
        return this.playerMessages.requestPetsState(this)(client, data)
    }

    @OnMessage(GamePlayerMessages.CLAIM_DAILY_REWARD)
    @EmitMessage(GamePlayerEvent.ClaimDailyRewardRequested)
    private handleClaimDailyReward(client: Client) {
        if (!this.playerMessages) {
            return null
        }
        return this.playerMessages.claimDailyReward(this)(client)
    }

    @OnMessage(GamePlayerMessages.UPDATE_SETTINGS)
    @EmitMessage(GamePlayerEvent.UpdateSettingsRequested)
    private handleUpdateSettings(client: Client, data: { name?: string; preferences?: Record<string, unknown> } = {}) {
        if (!this.playerMessages) {
            return null
        }
        return this.playerMessages.updateSettings(this)(client, data)
    }

    @OnMessage(GamePlayerMessages.UPDATE_TUTORIAL)
    @EmitMessage(GamePlayerEvent.UpdateTutorialRequested)
    private handleUpdateTutorial(
        client: Client,
        data: { step?: string; completed?: boolean; progress?: Record<string, unknown> } = {},
    ) {
        if (!this.playerMessages) {
            return null
        }
        return this.playerMessages.updateTutorial(this)(client, data)
    }

    private startSimulationLoop() {
        this.setSimulationInterval(() => this.updateGameLogic(), ROOM_CONFIG.updateInterval)
        this.logger.debug("⏱️ Simulation loop started")
    }

    private updateGameLogic() {
        this.state.players.forEach((player) => {
            player.pets?.forEach((pet) => this.tickPetStats(pet))
        })

        const now = Date.now()
        if (now - this.lastStatePersistedAt >= 60_000) {
            this.lastStatePersistedAt = now
            this.logger.debug("💾 State snapshot persisted (placeholder)")
        }
    }

    private tickPetStats(pet: Pet) {
        const decrease = 1
        pet.hunger = Math.max(0, pet.hunger - decrease)
        pet.happiness = Math.max(0, pet.happiness - decrease)
        pet.cleanliness = Math.max(0, pet.cleanliness - decrease)
        pet.lastUpdated = Date.now()
    }

    private syncPlayerPets(player: Player) {
        if (!player.pets) {
            return
        }

        player.pets.forEach((pet) => {
            this.state.pets.set(pet.id, pet)
        })
        player.totalPetsOwned = player.pets.size
    }

    private cleanupPlayerPets(sessionId: string) {
        const petIdsToRemove: string[] = []
        this.state.pets.forEach((pet, petId) => {
            if (pet.ownerId === sessionId) {
                petIdsToRemove.push(petId)
            }
        })

        petIdsToRemove.forEach((petId) => {
            this.state.pets.delete(petId)
        })
    }

    private sendWelcomeMessage(client: Client, player: Player) {
        client.send("welcome", {
            message: `Welcome to ${this.state.roomName}, ${player.name}!`,
            roomId: this.roomId,
        })
    }

    private sendStateSnapshot(client: Client) {
        const player = this.state.players.get(client.sessionId)
        client.send("state_snapshot", {
            player,
            room: {
                roomId: this.roomId,
                playerCount: this.state.playerCount,
            },
        })
    }

    private async bootstrapRoomWithRetry() {
        if (!this.retryService) {
            return
        }

        await this.retryService.retry({
            action: async () => {
                this.logger.debug(`🚀 GameRoom ${this.roomId} ready`)
            },
            maxRetries: 3,
            delay: 100,
        })
    }
}
