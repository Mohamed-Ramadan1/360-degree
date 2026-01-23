// Nest specific imports
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
// import { APP_GUARD, RouterModule, APP_FILTER } from '@nestjs/core'; ThrottlerGuard => gon be used later stage of the application
import { ScheduleModule } from '@nestjs/schedule';

// Application modules imports
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { databaseConfig, appConfig, redisConfig, jwtConfig } from './config';
// import { LogsModule } from './logs/logs.module';
// import { LoggerService } from './logs/logger.service';

// import { CommonModule } from './common/common.module';

// import { QueuesModule } from './queues/queues.module';
// import { RedisModule } from 'infrastructure/redis/redis.module';
// import { validate } from '@config/env.validation';
// import { AllExceptionsFilter } from '@common/filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig, redisConfig, jwtConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    AuthModule,
    UsersModule,

    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 minute
        limit: 60, // 60 requests per minute
      },
      {
        name: 'strict',
        ttl: 60000, // 1 minute
        limit: 10, // For sensitive endpoints
      },
      {
        name: 'auth',
        ttl: 900000, // 15 minutes
        limit: 5, // For login/signup
      },
    ]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<boolean>('database.synchronize'),
        autoLoadEntities: true,
        logging: configService.get<boolean>('database.logging'),
        maxQueryExecutionTime: 1000,
        // migrationsRun: true,
        // migrations: [__dirname + '/migrations/*{.ts,.js}'],
      }),
    }),
  ],
  controllers: [],
  providers: [
    // {
    //   provide: APP_FILTER,
    //   useClass: AllExceptionsFilter,
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard,
    // },
  ],
})
export class AppModule {}
