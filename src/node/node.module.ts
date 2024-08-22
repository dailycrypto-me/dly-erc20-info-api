import { HttpModule } from '@nestjs/axios';
import { Module, CacheModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NodeController } from './node.controller';
import { NodeService } from './node.service';
import { buildCacheConfig } from '../config/cacheConfig';
import { TokenModule } from '../token/token.module';
@Module({
  imports: [
    TokenModule,
    ConfigModule,
    HttpModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        buildCacheConfig(configService),
    }),
  ],
  controllers: [NodeController],
  providers: [NodeService],
})
export class NodeModule {}
