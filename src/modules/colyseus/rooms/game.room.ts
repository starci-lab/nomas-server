import { Client } from "colyseus"
import { RetryService } from "@modules/mixin"
import { GameRoomState, Pet, Player } from "@modules/colyseus/schemas"
import { BaseRoom } from "./base.room"
import { OnMessage } from "../decorators"
import { PetService } from "@apps/nomas-colyseus/src/gameplay/handlers/pet/pet.message-handlers"
import { FoodMessageHandlers } from "@apps/nomas-colyseus/src/gameplay/handlers/food/food.message-handlers"
import { InventoryMessageHandlers } from "@apps/nomas-colyseus/src/gameplay/handlers/inventory/inventory.message-handlers"
import { PlayerMessageHandlers } from "@apps/nomas-colyseus/src/gameplay/handlers/player/player.message-handlers"
import { PetRoomHandlers } from "@apps/nomas-colyseus/src/gameplay/handlers/pet/pet.room-handlers"
import { FoodRoomHandlers } from "@apps/nomas-colyseus/src/gameplay/handlers/food/food.room-handlers"
import { InventoryRoomHandlers } from "@apps/nomas-colyseus/src/gameplay/handlers/inventory/inventory.room-handlers"
import { PlayerRoomHandlers } from "@apps/nomas-colyseus/src/gameplay/handlers/player/player.room-handlers"

const ROOM_CONFIG = {
    maxClients: 4,
    updateInterval: 1000,
    reconnectionTime: 60,
}

interface GameRoomOptions {
    name?: string
    addressWallet?: string
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
        this.registerDecoratedHandlers() // Register basic room handlers
        this.registerModuleHandlers() // Register module-based handlers (only if services available)
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

    private registerModuleHandlers() {
        // Only initialize and register handlers if their services are available
        if (this.petMessages) {
            const petRoomHandlers = new PetRoomHandlers(this, this.petMessages)
            petRoomHandlers.register()
        }

        if (this.foodMessages) {
            const foodRoomHandlers = new FoodRoomHandlers(this, this.foodMessages)
            foodRoomHandlers.register()
        }

        if (this.inventoryMessages) {
            const inventoryRoomHandlers = new InventoryRoomHandlers(this, this.inventoryMessages)
            inventoryRoomHandlers.register()
        }

        if (this.playerMessages) {
            const playerRoomHandlers = new PlayerRoomHandlers(this, this.playerMessages)
            playerRoomHandlers.register()
        }
    }

    private initializeRoom(options: GameRoomOptions) {
        this.setState(new GameRoomState())
        this.state.roomName = options?.name || "Pet Simulator Room"
        this.logger.debug(`🏠 GameRoom created (${this.roomId})`)
    }

    // Basic room message handlers (kept in GameRoom for room-specific logic)
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
