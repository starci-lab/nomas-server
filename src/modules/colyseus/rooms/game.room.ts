import { Room, Client } from "colyseus"
import { INestApplication } from "@nestjs/common"
import { RetryService } from "@modules/mixin"
import { GameRoomState, Player, Pet } from "@modules/colyseus/schemas/game.schema"

const ROOM_CONFIG = {
    maxClients: 4,
    updateInterval: 1000,
    reconnectionTime: 60,
}

interface GameRoomOptions {
    name?: string
    addressWallet?: string
}

export class GameRoom extends Room<GameRoomState> {
    private readonly app: INestApplication
    private retryService: RetryService | null = null
    private lastStatePersistedAt = 0

    maxClients = ROOM_CONFIG.maxClients

    constructor() {
        super()
        this.app = globalThis.__APP__
    }

    async onCreate(options: GameRoomOptions) {
        this.initializeDependencies()
        this.initializeRoom(options)
        this.registerMessageHandlers()
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
        console.log(`👋 Player joined: ${player.name} (${client.sessionId}). Total players: ${this.state.playerCount}`)
    }

    onLeave(client: Client, consented?: boolean) {
        const player = this.state.players.get(client.sessionId)
        if (!player) {
            return
        }

        this.cleanupPlayerPets(client.sessionId)
        this.state.players.delete(client.sessionId)
        this.state.playerCount = this.state.players.size

        console.log(`👋 Player left: ${player.name} (${client.sessionId}). consented=${consented}`)
        this.allowReconnection(client, ROOM_CONFIG.reconnectionTime)
    }

    onDispose() {
        console.log("🧹 Disposing GameRoom", this.roomId)
    }

    private initializeDependencies() {
        this.retryService = this.app.get(RetryService)
    }

    private initializeRoom(options: GameRoomOptions) {
        this.setState(new GameRoomState())
        this.state.roomName = options?.name || "Pet Simulator Room"
        console.log(`🏠 GameRoom created (${this.roomId})`)
    }

    private registerMessageHandlers() {
        this.onMessage("request_state", (client) => {
            this.sendStateSnapshot(client)
        })

        this.onMessage("update_player_name", (client, message: { name?: string }) => {
            const player = this.state.players.get(client.sessionId)
            if (!player || !message?.name) {
                return
            }
            player.name = message.name
        })
    }

    private startSimulationLoop() {
        this.setSimulationInterval(() => this.updateGameLogic(), ROOM_CONFIG.updateInterval)
        console.log("⏱️ Simulation loop started")
    }

    private updateGameLogic() {
        this.state.players.forEach((player) => {
            player.pets?.forEach((pet) => this.tickPetStats(pet))
        })

        const now = Date.now()
        if (now - this.lastStatePersistedAt >= 60_000) {
            this.lastStatePersistedAt = now
            console.log("💾 State snapshot persisted (placeholder)")
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
                console.log(`🚀 GameRoom ${this.roomId} ready`)
            },
            maxRetries: 1,
            delay: 100,
        })
    }
}
