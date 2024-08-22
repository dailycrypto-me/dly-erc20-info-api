import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

export async function buildCacheConfig(
  configService: ConfigService,
): Promise<any> {
  return {
    store: await redisStore({
      socket: {
        host: configService.get('redisHost'),
        port: configService.get('redisPort'),
      },
      password: configService.get('redisPassword'),
      database: 2,
    }),
  };
}
