import "reflect-metadata"

export const ROOM_EVENT_LISTENER_METADATA_KEY = "colyseus:room_event_listeners"

export interface RoomEventListenerMetadata {
    eventName: string
    methodName: string | symbol
}

/**
 * Decorator to automatically register event listener in Colyseus Room
 * Similar to NestJS @OnEvent() but works with Colyseus Room instances
 *
 * Usage:
 * @OnRoomEvent(GamePetEvent.BuyResponse)
 * onBuyPetResponse(payload: BuyPetResponsePayload) {
 *   // handle event
 * }
 */
export const OnRoomEvent = (eventName: string) => {
    return function (target: object, propertyKey: string | symbol) {
        const existingListeners: Array<RoomEventListenerMetadata> =
            Reflect.getMetadata(ROOM_EVENT_LISTENER_METADATA_KEY, target.constructor) || []

        existingListeners.push({
            eventName,
            methodName: propertyKey,
        })

        Reflect.defineMetadata(ROOM_EVENT_LISTENER_METADATA_KEY, existingListeners, target.constructor)
    }
}
