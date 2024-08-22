import {
  Controller,
  Get,
  CacheTTL,
  CacheInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StakingService } from './staking.service';

@ApiTags('Staking')
@Controller('staking')
export class StakingController {
  constructor(private readonly stakingService: StakingService) {}

  @Get()
  async stakingData() {
    const totalStaked = await this.stakingService.totalDelegated();
    const totalDelegated = await this.stakingService.totalDelegated();
    const avgValidatorCommission = (
      await this.stakingService.averageWeightedCommission()
    ).averageWeightedCommission.toString();
    const avgStakingYield = await this.avgStakingYield();
    return {
      totalStaked,
      totalDelegated,
      avgValidatorCommission,
      avgStakingYield,
    };
  }
  /**
   * Returns the current DLY staked in the ecosystem
   * @returns staked supply in ETH
   */
  @Get('totalStake')
  @CacheTTL(36000000)
  @UseInterceptors(CacheInterceptor)
  async totalStaked() {
    return await this.stakingService.totalDelegated();
  }

  /**
   * Returns the current DLY delegated in the ecosystem
   * @returns delegated supply in ETH
   */
  @Get('totalDelegated')
  @CacheTTL(36000000)
  @UseInterceptors(CacheInterceptor)
  async totalDelegated() {
    return await this.stakingService.totalDelegated();
  }

  /**
   * Returns the current avegare weighted validator commission in the ecosystem
   * @returns avegrage weighted validator commission
   */
  @Get('avc')
  @CacheTTL(36000000)
  @UseInterceptors(CacheInterceptor)
  async avgValidatorCommission() {
    return (await this.stakingService.averageWeightedCommission())
      .averageWeightedCommission;
  }

  /**
   * Returns the current avegare staking validator yield in the ecosystem
   * @returns avegare staking validator yield
   */
  @Get('asy')
  @CacheTTL(36000000)
  @UseInterceptors(CacheInterceptor)
  async avgStakingYield() {
    const avgValidatorCommission = await this.avgValidatorCommission();
    const avgStakingYield =
      20 * (1 - parseFloat(avgValidatorCommission.toString()));
    return avgStakingYield.toString();
  }
}
