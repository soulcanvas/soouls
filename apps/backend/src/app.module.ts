import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServicesModule } from './services/services.module';
import { TrpcModule } from './trpc/trpc.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [ScheduleModule.forRoot(), ServicesModule, TrpcModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
