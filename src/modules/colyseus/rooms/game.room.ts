import { Client } from "colyseus"
import { RetryService } from "@modules/mixin"
import { GameRoomState, Pet, Player } from "@modules/colyseus/schemas"
import { GamePetMessages } from "@modules/game"
import { PetService } from "@apps/nomas-colyseus/src/gameplay/handlers/pet/pet.message-handlers"
import { BaseRoom } from "./base.room"
import { OnMessage, EmitMessage } from "../decorators"
import { GamePetEvent } from "@modules/game/pet/pet.events"

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
