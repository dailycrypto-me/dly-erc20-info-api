import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { ValidatorData } from '../utils/types';

@Injectable()
export class DposContract {
  private ethersProvider: ethers.providers.JsonRpcProvider;
  public instance: ethers.Contract;
  constructor(private configService: ConfigService) {
    this.ethersProvider = new ethers.providers.JsonRpcProvider(
      this.configService.get<string>('dlyProvider'),
    );

    this.instance = new ethers.Contract(
      this.configService.get<string>('dposAddress'),
      [
        'function getValidators(uint32 batch) view returns (tuple(address account, tuple(uint256 total_stake, uint256 commission_reward, uint16 commission, uint64 last_commission_change, uint16 undelegations_count, address owner, string description, string endpoint) info)[] validators, bool end)',
      ],
      this.ethersProvider,
    );
  }

  public async fetchDelegationData(): Promise<ValidatorData[]> {
    let validators: ValidatorData[] = [];
    let isDone = false;
    let index = 0;
    while (!isDone) {
      const res: {
        validators: ValidatorData[];
        end: boolean;
      } = await this.instance.getValidators(index);
      validators = validators.concat(res.validators);
      isDone = res.end;
      index++;
    }
    return validators;
  }
}
