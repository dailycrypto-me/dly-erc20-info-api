import { InjectGraphQLClient } from '@golevelup/nestjs-graphql-request';
import { Injectable } from '@nestjs/common';
import { gql, GraphQLClient } from 'graphql-request';

@Injectable()
export class GraphQLService {
  constructor(
    @InjectGraphQLClient()
    private readonly graphQLClient: GraphQLClient,
  ) {}

  public async getRepoNames(endCursor?: string): Promise<any> {
    return await this.graphQLClient.request(
      gql`
        query getRepoNames($endCursor: String) {
          organization(login: "dailycrypto-me") {
            repositories(first: 100, after: $endCursor) {
              totalCount
              edges {
                node {
                  name
                  isArchived
                  visibility
                }
              }
              pageInfo {
                endCursor
                hasNextPage
              }
            }
          }
        }
      `,
      {
        endCursor,
      },
    );
  }

  public async getRepoCommitsSince(
    repoName: string,
    since: Date,
    before: Date,
    endCursor?: string,
  ): Promise<any> {
    return await this.graphQLClient.request(
      gql`
        query get_repo_commits(
          $login: String!
          $name: String!
          $since: GitTimestamp!
          $until: GitTimestamp!
          $endCursorRefs: String
        ) {
          repository(owner: $login, name: $name) {
            name
            refs(first: 100, refPrefix: "refs/heads/", after: $endCursorRefs) {
              edges {
                node {
                  name
                  target {
                    ... on Commit {
                      id
                      history(first: 100, since: $since, until: $until) {
                        totalCount
                        edges {
                          node {
                            oid
                            message
                          }
                        }
                      }
                    }
                  }
                }
              }
              pageInfo {
                endCursor
                hasNextPage
              }
            }
          }
        }
      `,
      {
        login: 'dailycrypto-me',
        name: repoName,
        endCursorRefs: endCursor,
        since: since.toISOString(),
        until: before.toISOString(),
      },
    );
  }
}
