import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import {
  appConfig,
  authConfig,
  businessConfig,
  databaseConfig,
  mailConfig,
  loggerConfig,
  swaggerConfig,
  throttleConfig,
} from './namespaces/index.js';

/** The only way application code reads configuration: `config.auth.accessTtl`, `config.app.isProduction`. */
@Injectable()
export class AppConfigService {
  constructor(
    @Inject(appConfig.KEY) readonly app: ConfigType<typeof appConfig>,
    @Inject(authConfig.KEY) readonly auth: ConfigType<typeof authConfig>,
    @Inject(businessConfig.KEY) readonly business: ConfigType<typeof businessConfig>,
    @Inject(databaseConfig.KEY) readonly database: ConfigType<typeof databaseConfig>,
    @Inject(mailConfig.KEY) readonly mail: ConfigType<typeof mailConfig>,
    @Inject(loggerConfig.KEY) readonly logger: ConfigType<typeof loggerConfig>,
    @Inject(swaggerConfig.KEY) readonly swagger: ConfigType<typeof swaggerConfig>,
    @Inject(throttleConfig.KEY) readonly throttle: ConfigType<typeof throttleConfig>,
  ) {}
}
