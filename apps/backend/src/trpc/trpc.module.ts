import { Module } from '@nestjs/common';
import { ServicesModule } from '../services/services.module';
import { UsersModule } from '../users/users.module';
import { TrpcController } from './trpc.controller';
import { TrpcRouter } from './trpc.router';

@Module({
  imports: [ServicesModule, UsersModule],
  controllers: [TrpcController],
  providers: [TrpcRouter],
  exports: [TrpcRouter],
})
export class TrpcModule {}
