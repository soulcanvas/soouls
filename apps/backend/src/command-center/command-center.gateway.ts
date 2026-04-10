import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { db, sql } from '@soouls/database/client';
import type { Server, Socket } from 'socket.io';
import { NotificationQueueService } from '../notifications/notification.queue';

@WebSocketGateway({
  cors: {
    origin: [
      process.env.COMMAND_CENTER_URL ?? 'http://localhost:3002',
      process.env.FRONTEND_URL ?? 'http://localhost:3001',
    ],
    credentials: true,
  },
  namespace: '/command-center',
})
@Injectable()
export class CommandCenterGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(CommandCenterGateway.name);
  private connectedClients = 0;
  private telemetryInterval: NodeJS.Timeout | null = null;

  @WebSocketServer()
  server!: Server;

  constructor(
    @Inject(NotificationQueueService)
    private readonly notificationQueue: NotificationQueueService,
  ) {}

  handleConnection(client: Socket) {
    this.connectedClients++;
    this.logger.log(`Client connected: ${client.id} (total: ${this.connectedClients})`);

    if (this.connectedClients === 1) {
      this.startTelemetryBroadcast();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedClients--;
    this.logger.log(`Client disconnected: ${client.id} (total: ${this.connectedClients})`);

    if (this.connectedClients === 0 && this.telemetryInterval) {
      clearInterval(this.telemetryInterval);
      this.telemetryInterval = null;
    }
  }

  @SubscribeMessage('request:telemetry')
  async handleTelemetryRequest(@ConnectedSocket() client: Socket) {
    const data = await this.collectTelemetry();
    client.emit('telemetry:update', data);
  }

  private startTelemetryBroadcast() {
    if (this.telemetryInterval) return;

    this.telemetryInterval = setInterval(async () => {
      try {
        const data = await this.collectTelemetry();
        this.server.emit('telemetry:update', data);
      } catch (error) {
        this.logger.error('Telemetry broadcast failed', error);
      }
    }, 5_000);
  }

  private async collectTelemetry() {
    const dbProbeStart = Date.now();

    const [queueCounts, dbPing, [connRow]] = await Promise.all([
      this.notificationQueue.getCounts(),
      db.execute<{ value: number }>(sql`select 1 as value`),
      db.select({ count: sql<number>`count(*)` }).from(sql`pg_stat_activity`),
    ]);

    const dbLatencyMs = Date.now() - dbProbeStart;

    return {
      timestamp: new Date().toISOString(),
      websocketClients: this.connectedClients,
      database: {
        latencyMs: dbLatencyMs,
        healthy: dbPing.length > 0,
        connections: Number(connRow?.count ?? 0),
      },
      queue: queueCounts,
    };
  }
}
