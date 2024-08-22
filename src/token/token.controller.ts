import {
  Controller,
  Get,
  CacheTTL,
  UseInterceptors,
  CacheInterceptor,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TokenService } from './token.service';

@ApiTags('Token')
@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get()
  async getTokenData() {
    return await this.tokenService.tokenData();
  }

  @Get('name')
  @CacheTTL(36000000)
  @UseInterceptors(CacheInterceptor)
  getName() {
    return this.tokenService.getName();
  }

  @Get('symbol')
  @CacheTTL(36000000)
  @UseInterceptors(CacheInterceptor)
  getSymbol() {
    return this.tokenService.getSymbol();
  }

  @Get('decimals')
  @CacheTTL(36000000)
  @UseInterceptors(CacheInterceptor)
  getDecimals() {
    return this.tokenService.getDecimals();
  }

  /**
   * Returns the current DLY price
   * @returns price as float
   */
  @Get('price')
  @CacheTTL(60000)
  @UseInterceptors(CacheInterceptor)
  async getPrice() {
    return (await this.tokenService.marketDetails()).price.toString();
  }

  /**
   * Returns the current DLY supply
   * @returns supply in ETH
   */
  @Get('totalSupply')
  @CacheTTL(36000000)
  @UseInterceptors(CacheInterceptor)
  async totalSupply() {
    return await this.tokenService.totalSupply();
  }

  /**
   * Returns the current DLY locked
   * @returns locked supply in ETH
   */
  @Get('totalLocked')
  @CacheTTL(36000000)
  @UseInterceptors(CacheInterceptor)
  async totalLocked() {
    return await this.tokenService.totalLocked();
  }
  /**
   * Returns the current DLY in circulation
   * @returns circulating supply in ETH
   */
  @Get('totalCirculating')
  async totalInCirculation() {
    return (
      await this.tokenService.marketDetails()
    ).circulatingSupply.toString();
  }
  /**
   * Returns the current DLY stakign ratio
   * @returns staking ratio percentage value with 15-precision decimals as float
   */
  @Get('stakingRatio')
  @CacheTTL(36000000)
  @UseInterceptors(CacheInterceptor)
  async stakingRatio() {
    return await this.tokenService.stakingRatio();
  }
  /**
   * Returns the current DLY market cap
   * @returns market cap in 8-precision decimals as float
   */
  @Get('mktCap')
  async mktCap() {
    return (await this.tokenService.marketDetails()).marketCap.toString();
  }
}
