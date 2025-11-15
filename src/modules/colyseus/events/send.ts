export enum GameActionSendMessage {
    Welcome = "welcome",
}

export interface SendWelcomePayload {
    message: string
    roomId: string
}