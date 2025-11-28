import { registerEnumType } from "@nestjs/graphql"
import { createEnumType } from "@utils"

export enum PetId {
    Chog = "Chog",
    KeoneDog = "KeoneDog",
    Ghost = "Ghost",
    Zombie = "Zombie",
}

export const GraphQLTypePetId = createEnumType(PetId)

registerEnumType(GraphQLTypePetId, {
    name: "PetId",
    description: "The ID of the pet",
    valuesMap: {
        [PetId.Chog]: { description: "The ID of the Chog pet" },
        [PetId.KeoneDog]: { description: "The ID of the KeoneDog pet" },
        [PetId.Ghost]: { description: "The ID of the Ghost pet" },
        [PetId.Zombie]: { description: "The ID of the Zombie pet" },
    },
})
/**
 * Enum representing unique identifiers for store items available in the game.
 * Used to reference specific items in gameplay logic, inventory, or seeding.
 */
export enum StoreItemId {
    Hamburger = "Hamburger",
    Ball = "Ball",
    Sky = "Sky",
    Apple = "Apple",
    Cake = "Cake",
    Coke = "Coke",
    IceCream = "IceCream",
    Watermelon = "Watermelon",
    Bone = "Bone",
    Daruma = "Daruma",
    Football = "Football",
    Game = "Game",
    Tedy = "Tedy",
    Broom = "Broom",
}

/**
 * GraphQL enum type for StoreItemId.
 * Ensures item references are type-safe and introspectable via GraphQL.
 */
export const GraphQLTypeStoreItemId = createEnumType(StoreItemId)

registerEnumType(GraphQLTypeStoreItemId, {
    name: "StoreItemId",
    description: "Unique identifiers for all store items available in the in-game shop.",
    valuesMap: {
        [StoreItemId.Hamburger]: { description: "Dog food that restores hunger and increases happiness slightly." },
        [StoreItemId.Ball]: { description: "A toy that boosts pet happiness when played with." },
        [StoreItemId.Sky]: { description: "A blue sky background for your pet’s environment." },
        [StoreItemId.Apple]: { description: "Healthy fruit that restores hunger and improves happiness." },
        [StoreItemId.Cake]: { description: "Sweet dessert that greatly boosts happiness for a short time." },
        [StoreItemId.Coke]: { description: "Refreshing drink that restores hunger slightly." },
        [StoreItemId.IceCream]: { description: "Cool ice cream that restores hunger and increases happiness." },
        [StoreItemId.Watermelon]: { description: "Summer treat that restores hunger and happiness." },
        [StoreItemId.Bone]: { description: "Chewable bone that restores hunger and boosts happiness." },
        [StoreItemId.Daruma]: { description: "Traditional toy that boosts happiness when interacted with." },
        [StoreItemId.Football]: { description: "Sporty toy that increases pet happiness and engagement." },
        [StoreItemId.Game]: { description: "Mini-game console that greatly entertains your pet." },
        [StoreItemId.Tedy]: { description: "Soft teddy toy that makes your pet happy and relaxed." },
        [StoreItemId.Broom]: { description: "Cleaning tool that restores your pet’s cleanliness stat." },
    },
})

/**
 * Enum representing unique identifiers for system configurations in the game.
 * Used to reference specific system settings, default values, and game-wide configurations.
 */
export enum SystemId {
    DefaultInfo = "DefaultInfo",
}

/**
 * GraphQL enum type for SystemId.
 * Ensures system configuration references are type-safe and introspectable via GraphQL.
 */
export const GraphQLTypeSystemId = createEnumType(SystemId)

registerEnumType(GraphQLTypeSystemId, {
    name: "SystemId",
    description: "Unique identifiers for system configurations that define game-wide settings and default values.",
    valuesMap: {
        [SystemId.DefaultInfo]: {
            description:
                "Default configuration system containing initial values for new users, such as starting token amount and default pet assignment.",
        },
    },
})
