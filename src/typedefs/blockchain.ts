import { registerEnumType } from "@nestjs/graphql"
import { createEnumType } from "@utils"

export enum Platform {
    Evm = "Evm",
    Solana = "Solana",
    Sui = "Sui",
    Aptos = "Aptos",
}

export const GraphQLTypePlatform = createEnumType(Platform)

registerEnumType(GraphQLTypePlatform, {
    name: "Platform",
    description:
        "Supported blockchain platforms that define how signatures are verified and transactions are executed.",
    valuesMap: {
        [Platform.Evm]: {
            description:
                "EVM-compatible networks such as Ethereum, BNB Smart Chain, and Polygon — using secp256k1-based signatures and standard Ethereum JSON-RPC transactions.",
        },
        [Platform.Solana]: {
            description:
                "Solana blockchain — a high-performance, proof-of-history network using Ed25519 signatures and parallel transaction execution.",
        },
        [Platform.Sui]: {
            description:
                "Sui blockchain — a Move-based, object-centric network optimized for composable assets and ultra-low-latency transactions.",
        },
        [Platform.Aptos]: {
            description:
                "Aptos blockchain — a Move-based layer-1 network emphasizing safety, upgradability, and fast deterministic execution built on the Diem heritage.",
        },
    },
})