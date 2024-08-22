import { HttpService } from '@nestjs/axios';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom, map } from 'rxjs';

@Injectable()
export class NodeService {
  private readonly logger = new Logger(NodeService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async noActiveValidators(testnet?: boolean) {
    let indexerRoot: string;
    if (testnet) {
      indexerRoot = this.configService.get<string>('testnetIndexerRootUrl');
    } else {
      indexerRoot = this.configService.get<string>('mainnetIndexerRootUrl');
    }
    const explorerApi = `${indexerRoot}/validators?start=0&limit=100`;
    let activeNodeNumber = 0;
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip,deflate,compress',
      };
      const realTimeDelegationData = await firstValueFrom(
        this.httpService.get(explorerApi, { headers }).pipe(
          map((res) => {
            return res.data.total;
          }),
          catchError((error) => {
            this.logger.error(error);
            throw new ForbiddenException('API not available');
          }),
        ),
      );
      activeNodeNumber = realTimeDelegationData;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Fetching details unsuccessful. Please try again later.',
      );
    }
    return {
      totalActive: activeNodeNumber,
    };
  }

  // async cumulativeCommisson() {
  //   let cumulativeCommission = BigNumber.from(0);
  //   const validators = await this.dposContract.fetchDelegationData();
  //   validators.forEach((validator) => {
  //     cumulativeCommission = cumulativeCommission.add(
  //       BigNumber.from(validator.info.commission_reward),
  //     );
  //   });
  //   return ethers.utils.formatEther(cumulativeCommission.toString());
  // }
}
