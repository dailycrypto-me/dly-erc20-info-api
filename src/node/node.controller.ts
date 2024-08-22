import {
  Controller,
  Get,
  CacheTTL,
  CacheInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NodeService } from './node.service';
import { TokenService } from '../token/token.service';
import { BigNumber } from 'ethers';

@ApiTags('Validators')
@Controller('validators')
export class NodeController {
  constructor(
    private readonly nodeService: NodeService,
    private readonly tokenService: TokenService,
  ) {}

  @Get()
  async validatorData() {
    const activeMainnet = (
      await this.nodeService.noActiveValidators()
    ).totalActive.toString();
    const activeTestnet = (
      await this.nodeService.noActiveValidators(true)
    ).totalActive.toString();
    // const cumulativeCommission = await this.nodeService.cumulativeCommisson();
    return {
      activeMainnet,
      activeTestnet,
      cumulativeCommission: '0',
    };
  }

  /**
   * Returns the active validators in the past week for the Daily Mainnet
   * @returns active validator amount
   */
  @Get('totalActive')
  @CacheTTL(36000000)
  @UseInterceptors(CacheInterceptor)
  async totalActiveValidatorsMainnet() {
    return (await this.nodeService.noActiveValidators()).totalActive.toString();
  }

  /**
   * Returns the active validators in the past week for the Daily Testnet
   * @returns active validator amount
   */
  @Get('totalActiveTestnet')
  @CacheTTL(36000000)
  @UseInterceptors(CacheInterceptor)
  async totaltotalActiveValidatorsTestnet() {
    return (
      await this.nodeService.noActiveValidators(true)
    ).totalActive.toString();
  }

  /**
   * Returns the cumulative commission earned by Daily Validators on the Daily Mainnet
   * @returns cumulative commission in ETH
   */
  @Get('cumulativeCommission')
  @CacheTTL(36000000)
  @UseInterceptors(CacheInterceptor)
  async cumulativeCommission() {
    // return await this.nodeService.cumulativeCommisson();
    return '0';
  }

  /**
   * Returns the cumulative rewards earned by Daily Validators on the Daily Mainnet
   * @returns cumulative rewards in ETH
   */
  @Get('cumulativeRewards')
  @CacheTTL(36000000)
  @UseInterceptors(CacheInterceptor)
  async cumulativeRewards() {
    const INITIAL_SUPPLY = '10000000000000000000000000000';
    const currentSupply = await this.tokenService.totalSupply();
    return BigNumber.from(currentSupply)
      .sub(BigNumber.from(INITIAL_SUPPLY).div(BigNumber.from(10).pow(18)))
      .toString();
  }
}
