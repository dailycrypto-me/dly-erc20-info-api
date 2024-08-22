import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { GraphQLService } from './graphql.connector.service';

interface CommitData {
  oid: string;
  message: string;
}

@Injectable()
export class GitHubService {
  private readonly logger = new Logger(GitHubService.name);
  constructor(private readonly graphQLService: GraphQLService) {}

  async getRepoNames() {
    let returnData: any;
    let endCursor: string;
    const repoNames = [] as string[];
    let isDone = false;
    while (!isDone) {
      try {
        returnData = await this.graphQLService.getRepoNames(endCursor);
      } catch (error) {
        this.logger.error(error);
        throw new InternalServerErrorException(
          'Fetching details unsuccessful. Please try again later.',
        );
      }
      returnData.organization.repositories.edges.forEach((edge) => {
        if (!edge.node.isArchived) {
          repoNames.push(edge.node.name);
        }
      });
      if (returnData.organization.repositories.pageInfo.hasNextPage === true) {
        endCursor = returnData.organization.repositories.pageInfo.endCursor;
      } else {
        isDone = true;
      }
    }
    return repoNames;
  }

  async commitsOfThisMonth() {
    const repoNames = await this.getRepoNames();
    let totalCommits = 0;
    let globalCommitData: CommitData[] = [];
    for (const repo of repoNames) {
      this.logger.warn(`Scanning commits for repo ${repo}`);
      let returnData;
      let endCursor;
      let isDone = false;
      while (!isDone) {
        try {
          const since = new Date(
            new Date().getUTCFullYear(),
            new Date().getMonth() - 1,
            1,
            0,
            0,
            0,
            0,
          );
          const before = new Date(
            new Date().getUTCFullYear(),
            new Date().getMonth(),
            1,
            0,
            0,
            0,
            0,
          );
          returnData = await this.graphQLService.getRepoCommitsSince(
            repo,
            since,
            before,
            endCursor,
          );
        } catch (error) {
          this.logger.error(error);
          isDone = true;
          throw new InternalServerErrorException(
            'Fetching details unsuccessful. Please try again later.',
          );
        }
        if (returnData) {
          let countedCommitData: CommitData[] = [];
          returnData.repository.refs.edges.forEach((edge) => {
            this.logger.debug(`Scanning branch ${edge.node.name}`);
            if (!edge.node.name?.includes('dependabot')) {
              if (Number(edge.node.target.history.totalCount || 0) > 0) {
                const commitHistory = [] as CommitData[];
                edge.node.target.history.edges.forEach((edge) => {
                  commitHistory.push({
                    oid: edge.node.oid,
                    message: edge.node.message,
                  });
                });
                // count unique merge commits by OID
                const duplicateOrMergeCommits =
                  edge.node.target.history.edges.filter(
                    (edge) =>
                      countedCommitData.filter(
                        (data) => data.oid === edge.node.oid,
                      ).length !== 0 ||
                      countedCommitData.filter(
                        (data) => data.message === edge.node.message,
                      ).length !== 0 ||
                      globalCommitData.filter(
                        (data) => data.oid === edge.node.oid,
                      ).length !== 0 ||
                      edge.node.message.toLowerCase().includes('merge'),
                  );
                countedCommitData.push(...commitHistory);
                countedCommitData = Array.from(new Set(countedCommitData));
                const uniquieCommitsForBranch =
                  Number(edge.node.target.history.totalCount || 0) -
                  duplicateOrMergeCommits.length;
                totalCommits += uniquieCommitsForBranch;
              }
            }
          });
          globalCommitData = Array.from(
            new Set(globalCommitData.concat(countedCommitData)),
          );
          if (returnData.repository.refs.pageInfo.hasNextPage === true) {
            endCursor = returnData.repository.refs.pageInfo.endCursor;
          } else {
            isDone = true;
          }
        }
      }
    }
    return {
      totalCommits,
    };
  }
}
