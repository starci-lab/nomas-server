import { ConfigurableModuleBuilder } from "@nestjs/common"
import { ColyseusOptions } from "./types"

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
    new ConfigurableModuleBuilder<ColyseusOptions>()
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
