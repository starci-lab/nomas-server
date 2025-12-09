import { registerEnumType } from "@nestjs/graphql"
import { createEnumType } from "@utils"

/**
 * Represents the category of an item available in the in-game store.
 * Each item type determines how it interacts with pets or the player's environment.
 */
export enum StoreItemType {
    /** Consumable items that restore hunger or provide nutrition. */
    Food = "food",

    /** Interactive items that increase a pet’s happiness when used. */
    Toy = "toy",

    /** Cleaning items that restore or maintain pet cleanliness. */
    Clean = "clean",

    /** Decorative or utility items placed in the player’s home or room. */
    Furniture = "furniture",

    /** Visual backgrounds for the player’s environment or habitat. */
    Background = "background",

    /** Pet-type items that represent adoptable pets or eggs. */
    Pet = "pet",
}

export const GraphQLTypeStoreItemType = createEnumType(StoreItemType)

// Optional: register with GraphQL so it appears in schema introspection
registerEnumType(GraphQLTypeStoreItemType, {
    name: "StoreItemType",
    description:
        "Defines all available item categories in the store, determining their usage and effect within the game world.",
    valuesMap: {
        [StoreItemType.Food]: { description: "Food items restore hunger or provide nutrition." },
        [StoreItemType.Toy]: { description: "Toy items increase a pet’s happiness when used." },
        [StoreItemType.Clean]: { description: "Clean items restore or maintain pet cleanliness." },
        [StoreItemType.Furniture]: {
            description: "Furniture items are decorative or utility items placed in the player’s home or room.",
        },
        [StoreItemType.Background]: {
            description: "Background items are visual backgrounds for the player’s environment or habitat.",
        },
        [StoreItemType.Pet]: { description: "Pet-type items represent adoptable pets or eggs." },
    },
})

export enum PetName {
    Chog = "Chog",
    KeoneDog = "KeoneDog",
    Ghost = "Ghost",
    Zombie = "Zombie",
}

export const GraphQLTypePetName = createEnumType(PetName)

registerEnumType(GraphQLTypePetName, {
    name: "PetName",
    description: "The name of the pet",
    valuesMap: {
        [PetName.Chog]: { description: "The name of the Chog pet" },
        [PetName.KeoneDog]: { description: "The name of the KeoneDog pet" },
        [PetName.Ghost]: { description: "The name of the Ghost pet" },
        [PetName.Zombie]: { description: "The name of the Zombie pet" },
    },
})

export enum InventoryKind {
    Furniture = "furniture",
    Background = "background",
}

export const GraphQLTypeInventoryKind = createEnumType(InventoryKind)
