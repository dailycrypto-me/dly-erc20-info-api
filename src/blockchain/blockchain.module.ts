import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DposContract } from './dpos.contract';

@Module({
  imports: [ConfigModule],
  providers: [DposContract],
  exports: [DposContract],
})
export class BlockchainModule {}
