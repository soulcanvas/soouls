import { Module } from '@nestjs/common';
import { NotificationDispatchService } from './notification-dispatch.service';
import { NotificationQueueService } from './notification.queue';
import { NotificationWorker } from './notification.worker';

@Module({
  providers: [NotificationQueueService, NotificationDispatchService, NotificationWorker],
  exports: [NotificationQueueService],
})
export class NotificationsModule {}
