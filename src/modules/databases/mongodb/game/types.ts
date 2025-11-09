export interface GameMongoDbOptions {
    // require seeder when established connection
    withSeeder?: boolean
    // require mannual trigger instead of automatic trigger
    manualTrigger?: boolean
    // loadToMemory: load static data to memory
    loadToMemory?: boolean
}