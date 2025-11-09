import { ConfigurableModuleBuilder } from "@nestjs/common"
import { GameSeedersOptions } from "./types"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<GameSeedersOptions>().setExtras(
        {
            isGlobal: false
        },
        (definition, extras) => ({
            ...definition,
            global: extras.isGlobal
        })
    ).build()