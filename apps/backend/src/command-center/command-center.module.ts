import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { ServicesModule } from '../services/services.module';
import { CommandCenterAuthGuard } from './command-center.auth.guard';
import { CommandCenterController } from './command-center.controller';
import { CommandCenterGateway } from './command-center.gateway';
import { CommandCenterService } from './command-center.service';

@Module({
  imports: [ServicesModule, NotificationsModule],
  controllers: [CommandCenterController],
  providers: [CommandCenterService, CommandCenterAuthGuard, CommandCenterGateway],
})
export class CommandCenterModule {}
