import { Inject, Injectable } from '@nestjs/common';
import { createAppRouter } from '@soouls/api/router';
import type { AppRouter, EntriesApi, MessagingApi } from '@soouls/api/router';
import { EntriesService } from '../entries/entries.service';
import { MessagingService } from '../services/messaging.service';
import { TasksService } from '../tasks/tasks.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class TrpcRouter {
  public readonly appRouter: AppRouter;

  constructor(
    private readonly entriesService: EntriesService,
    private readonly messagingService: MessagingService,
    private readonly tasksService: TasksService,
    private readonly usersService: UsersService,
  ) {
    this.appRouter = createAppRouter({
      entries: this.entriesService as unknown as EntriesApi,
      messaging: this.messagingService as unknown as MessagingApi,
      tasks: this.tasksService,
      users: this.usersService,
    });
  }
}
