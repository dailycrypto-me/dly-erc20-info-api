import {
  Controller,
  Get,
  CacheTTL,
  UseInterceptors,
  CacheInterceptor,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GitHubService } from './github.service';

@ApiTags('Contributions')
@Controller('contributions')
export class GitHubController {
  constructor(private readonly ghService: GitHubService) {}

  @Get()
  async contributionData() {
    const commitsThisMonth = (await this.ghService.commitsOfThisMonth())
      .totalCommits;
    return {
      commitsThisMonth,
    };
  }
  /**
   * Returns the number of commits from the current month from the dailycrypto-me organization
   * @returns number of commits of current month
   */
  @Get('commits')
  @CacheTTL(36000000)
  @UseInterceptors(CacheInterceptor)
  async commitsOfCurrentMonth() {
    return (await this.ghService.commitsOfThisMonth()).totalCommits;
  }
}
