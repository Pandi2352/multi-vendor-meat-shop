import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfigService } from '#config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        uri: config.database.uri,
        autoIndex: config.database.autoIndex,
        maxPoolSize: config.database.maxPoolSize,
        serverSelectionTimeoutMS: config.database.serverSelectionTimeoutMs,
      }),
    }),
  ],
})
export class DatabaseModule {}
