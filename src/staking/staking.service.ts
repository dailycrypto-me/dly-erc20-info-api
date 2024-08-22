import { Injectable } from '@nestjs/common';
import { BigNumber } from 'ethers';
import { DposContract } from '../blockchain/dpos.contract';
import { ValidatorData } from '../utils/types';
import { Decimal } from 'decimal.js';
@Injectable()
export class StakingService {
  constructor(private readonly dposContract: DposContract) {}

  async totalDelegated() {
    const validators = await this.dposContract.fetchDelegationData();

    const total = validators.reduce((acc, validator: ValidatorData) => {
      return acc.add(validator.info.total_stake);
    }, BigNumber.from(0));

    return total.div(BigNumber.from(10).pow(18)).toString();
  }

  async averageWeightedCommission() {
    const validators = await this.dposContract.fetchDelegationData();
    const totalDelegation = validators.reduce(
      (acc, validator: ValidatorData) => {
        return acc.add(validator.info.total_stake);
      },
      BigNumber.from(0),
    );

    let totalWeightedCommission = BigNumber.from(0);
    validators.forEach((node: ValidatorData) => {
      totalWeightedCommission = totalWeightedCommission.add(
        BigNumber.from(node.info.commission).mul(
          BigNumber.from(node.info.total_stake),
        ),
      );
    });

    const weightedAverage = new Decimal(totalWeightedCommission.toString())
      .div(new Decimal(totalDelegation.toString()))
      .div(new Decimal(100))
      .toString();

    return {
      totalDelegated: totalDelegation,
      averageWeightedCommission: weightedAverage,
    };
  }
}
