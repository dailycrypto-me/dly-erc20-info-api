import {
  CACHE_MANAGER,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError, map } from 'rxjs';
import { Cache } from 'cache-manager';
import { MarketDetails } from '../utils/types';
import { StakingService } from '../staking/staking.service';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  private ethersProvider: ethers.providers.JsonRpcProvider;
  private redisName: string;
  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly delegationService: StakingService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.ethersProvider = new ethers.providers.JsonRpcProvider(
      this.configService.get<string>('dlyProvider'),
    );

    this.redisName = `${this.configService.get('redisName')}`;
  }
  getName() {
    return 'Daily Coin';
  }
  getSymbol() {
    return 'DLY';
  }
  getDecimals() {
    return '18';
  }
  async _getPrice() {
    const dlyDetailsCG = this.configService.get<string>('coinGeckoDailyApi');
    let priceDetails;
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip,deflate,compress',
      };
      const realTimePriceData = await firstValueFrom(
        this.httpService.get(`${dlyDetailsCG}`, { headers }).pipe(
          map((res) => {
            return res.data;
          }),
          catchError((error) => {
            this.logger.error(error);
            throw new ForbiddenException('API not available');
          }),
        ),
      );
      priceDetails = realTimePriceData;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Fetching details unsuccessful. Please try again later.',
      );
    }
    return Number(priceDetails.daily.usd || 0);
  }
  async totalSupply() {
    const indexerRoot = this.configService.get<string>('mainnetIndexerRootUrl');
    const totalSupplyUrl = `${indexerRoot}/totalSupply`;
    let totalSupply = BigNumber.from(0);

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip,deflate,compress',
      };
      const response = await firstValueFrom(
        this.httpService.get(totalSupplyUrl, { headers }).pipe(
          map((res) => {
            return res.data;
          }),
          catchError((error) => {
            this.logger.error(error);
            throw new ForbiddenException('API not available');
          }),
        ),
      );
      totalSupply = BigNumber.from(response);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Fetching details unsuccessful. Please try again later.',
      );
    }

    return totalSupply
      .div(BigNumber.from(10).pow(parseInt(this.getDecimals(), 10)))
      .toString();
  }
  async dposBalance() {
    const dposAddress = this.configService.get<string>('dposAddress');
    if (!dposAddress) {
      return '0';
    }
    const decimals = parseInt(this.getDecimals(), 10);
    const dposBalance = await this.ethersProvider.getBalance(dposAddress);
    return dposBalance.div(BigNumber.from(10).pow(decimals)).toString();
  }
  async foundationBalance() {
    const foundationAddress =
      this.configService.get<string>('foundationAddress');
    if (!foundationAddress) {
      return '0';
    }
    const decimals = parseInt(this.getDecimals(), 10);
    const foundationBalance = await this.ethersProvider.getBalance(
      foundationAddress,
    );
    return foundationBalance.div(BigNumber.from(10).pow(decimals)).toString();
  }
  async totalLocked() {
    const deployerAddress = this.configService.get<string>('deployerAddress');
    if (deployerAddress) {
      const decimals = parseInt(this.getDecimals(), 10);
      const totalLocked = await this.ethersProvider.getBalance(deployerAddress);
      return totalLocked.div(BigNumber.from(10).pow(decimals)).toString();
    } else return '0';
  }
  async totalCirculation() {
    return (
      Number(await this.totalSupply()) -
      Number(await this.totalLocked()) -
      Number(await this.dposBalance()) -
      Number(await this.foundationBalance())
    );
  }
  async stakingRatio() {
    return (
      (Number(await this.delegationService.totalDelegated()) /
        (Number(await this.totalSupply()) - Number(await this.totalLocked()))) *
      100
    ).toString();
  }
  async marketDetails() {
    const key = this.redisName ? `${this.redisName}_marketCap` : 'marketCap';
    const details = (await this.cacheManager.get(key)) as MarketDetails;
    if (details) {
      return details;
    }

    try {
      const price = await this._getPrice();
      const circulatingSupply = await this.totalCirculation();
      const marketCap = price * circulatingSupply;
      const marketDetails = {
        price,
        circulatingSupply,
        marketCap,
      };
      await this.cacheManager.set(key, marketDetails, 60000);

      return marketDetails;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Fetching market details failed. Reason: ',
        error,
      );
    }
  }

  async tokenData() {
    const marketDetails = await this.marketDetails();
    const name = this.getName();
    const symbol = this.getSymbol();
    const decimals = this.getDecimals();
    const totalSupply = await this.totalSupply();
    const totalLocked = await this.totalLocked();
    const stakingRatio = await this.stakingRatio();
    return {
      name,
      symbol,
      decimals,
      totalSupply,
      totalLocked,
      stakingRatio,
      price: marketDetails.price.toString(),
      circulatingSupply: marketDetails.circulatingSupply.toString(),
      marketCap: marketDetails.marketCap.toString(),
    };
  }
}
