import { CacheModule, Module } from '@nestjs/common';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StakingService } from './staking.service';
import { StakingController } from './staking.controller';
import { buildCacheConfig } from '../config/cacheConfig';

@Module({
  imports: [
    ConfigModule,
    BlockchainModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        buildCacheConfig(configService),
    }),
  ],
  controllers: [StakingController],
  providers: [StakingService],
  exports: [StakingService],
})
export class StakingModule {}
