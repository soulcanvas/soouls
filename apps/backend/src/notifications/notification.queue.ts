import { Inject, Injectable, type OnModuleDestroy } from '@nestjs/common';
import { type JobsOptions, Queue } from 'bullmq';
import {
  NOTIFICATIONS_QUEUE,
  type NotificationJobData,
  type NotificationJobName,
  createRedisConnection,
} from './notification.constants';

const DEFAULT_JOB_OPTIONS: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2_000,
  },
  removeOnComplete: 200,
  removeOnFail: 200,
};

@Injectable()
export class NotificationQueueService implements OnModuleDestroy {
  private readonly connection = createRedisConnection();
  private readonly queue = this.connection
    ? new Queue<NotificationJobData, void, NotificationJobName>(NOTIFICATIONS_QUEUE, {
        connection: this.connection,
        defaultJobOptions: DEFAULT_JOB_OPTIONS,
      })
    : null;

  isConfigured() {
    return this.queue !== null;
  }

  async add(name: NotificationJobName, data: NotificationJobData) {
    if (!this.queue) {
      throw new Error('REDIS_URL is not configured for the notifications queue.');
    }

    return this.queue.add(name, data, {
      jobId: `${name}:${JSON.stringify(data)}`,
    });
  }

  async enqueueWelcomeSequence(userId: string) {
    return this.add('welcome-sequence', { userId });
  }

  async enqueueSecureAccess(email: string) {
    return this.add('secure-access', { email });
  }

  async enqueueAdminInvite(inviteId: string) {
    return this.add('admin-invite', { inviteId });
  }

  async enqueueCampaignDispatch(campaignId: string) {
    return this.add('campaign-dispatch', { campaignId });
  }

  async getCounts() {
    if (!this.queue) {
      return {
        waiting: 0,
        active: 0,
        delayed: 0,
        failed: 0,
      };
    }

    const [waiting, active, delayed, failed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getDelayedCount(),
      this.queue.getFailedCount(),
    ]);

    return {
      waiting,
      active,
      delayed,
      failed,
    };
  }

  async onModuleDestroy() {
    await this.queue?.close();
  }
}
