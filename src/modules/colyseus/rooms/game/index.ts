import { Client } from "colyseus"
import { RetryService } from "@modules/mixin"
import { GameRoomColyseusSchema, PlayerColyseusSchema } from "../../schemas"
import { GameRoomOptions } from "./types"
import { AbstractSenderGameRoom } from "./sender.room"
import { GAME_ROOM_MAX_CLIENTS } from "./constanst"
import { GAME_ROOM_RECONNECTION_TIME } from "./constanst"
import { PrometheusService } from "@modules/prometheus/providers/prometheus.service"

export class GameRoom extends AbstractSenderGameRoom {
    maxClients = GAME_ROOM_MAX_CLIENTS

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
            // Prometheus service not available, continue without tracking
        }
    }

    async onJoin(client: Client, options: GameRoomOptions) {
        const player = new PlayerColyseusSchema()
        player.sessionId = client.sessionId
        player.walletAddress = options?.userAddress

        this.state.players.set(client.sessionId, player)
        this.state.playerCount = this.state.players.size

        this.registerPlayerPets(player)
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
            // Prometheus service not available, continue without tracking
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
            // Prometheus service not available, continue without tracking
        }
    }

    // attach nestjs dependencies
    private initializeDependencies() {
        // Initialize base room dependencies (eventEmitter, dayjsService, retryService)
        this.initialize()
        this.retryService = this.app.get(RetryService, { strict: false })
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
