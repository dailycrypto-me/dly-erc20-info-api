import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { buildCacheConfig } from './config/cacheConfig';
import general from './config/general';
import { GitHubModule } from './github/github.module';
import { NodeModule } from './node/node.module';
import { StakingModule } from './staking/staking.module';
import { TokenModule } from './token/token.module';
import { BlockchainModule } from './blockchain/blockchain.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [general],
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        buildCacheConfig(configService),
    }),
    SwaggerModule,
    TokenModule,
    StakingModule,
    NodeModule,
    GitHubModule,
    BlockchainModule,
  ],
})
export class AppModule {}
