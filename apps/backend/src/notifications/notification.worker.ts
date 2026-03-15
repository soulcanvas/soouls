import { Inject, Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { type Job, Worker } from 'bullmq';
import { NotificationDispatchService } from './notification-dispatch.service';
import {
  NOTIFICATIONS_QUEUE,
  type NotificationJobData,
  type NotificationJobName,
  createRedisConnection,
} from './notification.constants';

@Injectable()
export class NotificationWorker implements OnModuleInit, OnModuleDestroy {
  private readonly connection = createRedisConnection();
  private worker: Worker<NotificationJobData, void, NotificationJobName> | null = null;

  constructor(
    @Inject(NotificationDispatchService)
    private readonly dispatcher: NotificationDispatchService,
  ) {}

  onModuleInit() {
    if (!this.connection) {
      console.warn('[Notifications] REDIS_URL is not configured. Worker is disabled.');
      return;
    }

    this.worker = new Worker<NotificationJobData, void, NotificationJobName>(
      NOTIFICATIONS_QUEUE,
      async (job) => this.processJob(job),
      {
        connection: this.connection,
        concurrency: Number(process.env.NOTIFICATION_WORKER_CONCURRENCY ?? 10),
      },
    );

    this.worker.on('failed', (job, error) => {
      console.error('[Notifications] Job failed', {
        id: job?.id,
        name: job?.name,
        error,
      });
    });
  }

  private async processJob(job: Job<NotificationJobData, void, NotificationJobName>) {
    switch (job.name) {
      case 'welcome-sequence':
        await this.dispatcher.processWelcomeSequence((job.data as { userId: string }).userId);
        return;
      case 'secure-access':
        await this.dispatcher.processSecureAccess((job.data as { email: string }).email);
        return;
      case 'admin-invite':
        await this.dispatcher.processAdminInvite((job.data as { inviteId: string }).inviteId);
        return;
      case 'campaign-dispatch':
        await this.dispatcher.processCampaignDispatch(
          (job.data as { campaignId: string }).campaignId,
        );
        return;
      default:
        throw new Error(`Unsupported notification job: ${job.name}`);
    }
  }

  async onModuleDestroy() {
    await this.worker?.close();
  }
}
