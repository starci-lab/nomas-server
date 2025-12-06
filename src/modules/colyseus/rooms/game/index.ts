import { Client } from "colyseus"
import { RetryService } from "@modules/mixin"
import { GameRoomColyseusSchema, PlayerColyseusSchema } from "../../schemas"
import { GameRoomOptions } from "./types"
import { AbstractSenderGameRoom } from "./sender.room"
import { GAME_ROOM_MAX_CLIENTS } from "./constanst"
import { GAME_ROOM_RECONNECTION_TIME } from "./constanst"
import { PrometheusService } from "@modules/prometheus/providers/prometheus.service"
import { JwtEphemeralService } from "@modules/jwt"
import { PlayerHandler } from "@modules/colyseus/handlers"

export class GameRoom extends AbstractSenderGameRoom {
    maxClients = GAME_ROOM_MAX_CLIENTS
    private static jwtService: JwtEphemeralService | null = null

    protected playerHandler: PlayerHandler | null = null

    // Getter method to lazy initialize
    private static getJwtService(): JwtEphemeralService {
        if (!GameRoom.jwtService) {
            const app = globalThis.__APP__
            if (!app) {
                throw new Error("NestJS application not available")
            }
            GameRoom.jwtService = app.get(JwtEphemeralService, { strict: false })
            if (!GameRoom.jwtService) {
                throw new Error("JwtEphemeralService not available")
            }
        }
        return GameRoom.jwtService
    }

    async onCreate(options: GameRoomOptions) {
        // initialize nestjs dependencies
        this.initializeDependencies()
        // initialize room state
        this.initializeRoom(options)
        // start simulation loop
        this.initializeSimulationLoop()
        // register receiver handlers
        this.registerReceiverHandlers()
        // bootstrap room with retry
        await this.bootstrapRoomWithRetry()

        // Track room creation metrics
        try {
            const prometheusService = this.app.get(PrometheusService, { strict: false })
            if (prometheusService) {
                prometheusService.incrementRoomCreated()
            }
        } catch (error) {
            this.logger.error("Error room creation metrics", error)
            // Prometheus service not available, continue without tracking
        }
    }

    static async onAuth(token: string) {
        const jwtService = this.getJwtService()
        const payload = await jwtService.verifyToken(token)
        return payload
    }

    async onJoin(client: Client, options: GameRoomOptions) {
        const player = new PlayerColyseusSchema()
        player.sessionId = client.sessionId
        player.walletAddress = options?.userAddress

        this.state.players.set(client.sessionId, player)
        this.state.playerCount = this.state.players.size

        if (this.playerHandler) {
            const result = await this.playerHandler.handleGetPetsState({
                room: this,
                client,
                sessionId: client.sessionId,
                data: {},
            })

            if (result.success) {
                this.logger.debug(`Loaded ${result.data?.pets?.length || 0} pets on join`)
            }
        }

        // this.registerPlayerPets(player)
        this.sendWelcomeMessage(client, player)
        this.logger.debug(
            `Player joined: ${player.walletAddress} (${client.sessionId}). Total players: ${this.state.playerCount}`,
        )

        // Track player join metrics
        try {
            const prometheusService = this.app.get(PrometheusService, { strict: false })
            if (prometheusService) {
                prometheusService.incrementPlayerJoined()
                prometheusService.setRoomPlayers(this.state.playerCount)
                const capacityUsage = (this.state.playerCount / this.maxClients) * 100
                prometheusService.setRoomMaxCapacityUsage(capacityUsage)
            }
        } catch (error) {
            this.logger.debug("Error player join metrics", error)
        }
    }

    onLeave(client: Client, consented?: boolean) {
        const player = this.state.players.get(client.sessionId)
        if (!player) {
            return
        }
        this.removePetsOwnedByPlayer(client.sessionId)
        this.state.players.delete(client.sessionId)
        this.state.playerCount = this.state.players.size
        this.logger.debug(`Player left: ${player.walletAddress} (${client.sessionId}). consented=${consented}`)
        this.allowReconnection(client, GAME_ROOM_RECONNECTION_TIME)

        // Track player leave metrics
        try {
            const prometheusService = this.app.get(PrometheusService, { strict: false })
            if (prometheusService) {
                prometheusService.incrementPlayerLeft()
                prometheusService.setRoomPlayers(this.state.playerCount)
                const capacityUsage = (this.state.playerCount / this.maxClients) * 100
                prometheusService.setRoomMaxCapacityUsage(capacityUsage)
            }
        } catch (error) {
            this.logger.debug("Error player leave metrics", error)
            // Prometheus service not available, continue without tracking
        }
    }

    onDispose() {
        this.logger.debug("Disposing GameRoom", this.roomId)

        // Track room disposal metrics
        try {
            const prometheusService = this.app.get(PrometheusService, { strict: false })
            if (prometheusService) {
                prometheusService.incrementRoomDisposed()
            }
        } catch (error) {
            this.logger.debug("Error room disposal metrics", error)
            // Prometheus service not available, continue without tracking
        }
    }

    // attach nestjs dependencies
    private initializeDependencies() {
        // Initialize base room dependencies (eventEmitter, dayjsService, retryService)
        this.initialize()
        this.retryService = this.app.get(RetryService, { strict: false })
        this.playerHandler = this.app.get(PlayerHandler, { strict: false })
    }

    // initialize room state
    private initializeRoom(options: GameRoomOptions) {
        this.state = new GameRoomColyseusSchema()
        this.state.roomName = `pet_simulator_room_${options?.userAddress}`
        this.logger.debug(`GameRoom created (${this.roomId})`)
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
