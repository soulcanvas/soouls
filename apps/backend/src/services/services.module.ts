import { Module } from '@nestjs/common';
import { EntriesService } from '../entries/entries.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { TasksService } from '../tasks/tasks.service';
import { MessagingService } from './messaging.service';

@Module({
  imports: [NotificationsModule],
  providers: [EntriesService, TasksService, MessagingService],
  exports: [EntriesService, TasksService, MessagingService],
})
export class ServicesModule {}
