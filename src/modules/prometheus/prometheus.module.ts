import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./prometheus.module-definition"
import { PrometheusModule as PrometheusCoreModule } from "@willsoto/nestjs-prometheus"
import { PrometheusOptions } from "./types"
import { MetricsProviders } from "./providers/metrics.registry"
import { PrometheusService } from "./providers/prometheus.service"

@Module({})
export class PrometheusModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE): DynamicModule {
        const dynamicModule = super.register(options)
        const prometheusCoreModule = PrometheusCoreModule.register(options as PrometheusOptions)

        return {
            ...dynamicModule,
            imports: [prometheusCoreModule],
            providers: [...MetricsProviders, PrometheusService],
            exports: [PrometheusService],
        }
    }
}
