// Nest specific imports
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
// import { APP_GUARD, RouterModule, APP_FILTER } from '@nestjs/core'; ThrottlerGuard => gon be used later stage of the application
import { ScheduleModule } from '@nestjs/schedule';

// Application modules imports
import { AuthModule, TodosModule, UsersModule } from './modules';

import { ConfigModule } from '@nestjs/config';
import { appConfig, jwtConfig } from './config';
import { LogsModule } from './logs/logs.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { CommonModule } from './common/common.module';
import { QueuesModule } from './queues/queues.module';
import { APP_FILTER, APP_GUARD, RouterModule } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { AuthGuard } from './common/guards';
import { dataSourceOptions } from '../data-source';

@Module({
  imports: [
    RouterModule.register([
      { path: 'auth', module: AuthModule },
      { path: 'users', module: UsersModule },
      { path: 'todos', module: TodosModule },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    AuthModule,
    UsersModule,
    TodosModule,
    LogsModule,
    RedisModule,
    CommonModule,
    QueuesModule,
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
    TypeOrmModule.forRoot(dataSourceOptions),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
