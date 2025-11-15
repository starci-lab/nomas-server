import { ConfigurableModuleBuilder } from "@nestjs/common"

export interface GamePetModuleOptions {
    isGlobal?: boolean
}

export const {
    ConfigurableModuleClass: ConfigurablePetModuleClass,
    MODULE_OPTIONS_TOKEN: GAME_PET_MODULE_OPTIONS_TOKEN,
    OPTIONS_TYPE: GAME_PET_MODULE_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<GamePetModuleOptions>()
    .setExtras(
        {
            isGlobal: false,
        },
        (definition, extras) => ({
            ...definition,
            global: extras.isGlobal,
        }),
    )
    .build()
