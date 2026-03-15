import { Inject, Injectable } from '@nestjs/common';
import { createAppRouter } from '@soulcanvas/api/router';
import type { AppRouter } from '@soulcanvas/api/router';
import { EntriesService } from '../entries/entries.service';
import { MessagingService } from '../services/messaging.service';
import { TasksService } from '../tasks/tasks.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class TrpcRouter {
  public readonly appRouter: AppRouter;

  constructor(
    @Inject(EntriesService) private readonly entriesService: EntriesService,
    @Inject(MessagingService) private readonly messagingService: MessagingService,
    @Inject(TasksService) private readonly tasksService: TasksService,
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {
    this.appRouter = createAppRouter({
      entries: this.entriesService,
      messaging: this.messagingService,
      tasks: this.tasksService,
      users: this.usersService,
    });
  }
}
