import { HttpModule } from '@nestjs/axios';
import { Module, CacheModule } from '@nestjs/common';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { buildCacheConfig } from '../config/cacheConfig';
import { StakingModule } from '../staking/staking.module';

@Module({
  imports: [
    BlockchainModule,
    ConfigModule,
    HttpModule,
    StakingModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        buildCacheConfig(configService),
    }),
  ],
  controllers: [TokenController],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
