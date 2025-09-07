import {
  WebSocketGateway as WSGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Server, Socket } from "socket.io";

export interface FileChangeEvent {
  event: "add" | "change" | "unlink";
  filePath: string;
  projectPath: string;
  timestamp: string;
}

export interface CursorUpdateEvent {
  id: string;
  status: "pending" | "running" | "completed" | "error";
  result?: string;
  error?: string;
  timestamp: string;
  duration?: number;
}

export interface ProjectUpdateEvent {
  projectPath: string;
  action: "created" | "updated" | "deleted";
  timestamp: string;
}

export interface GitUpdateEvent {
  projectPath: string;
  action: "commit" | "push" | "pull" | "checkout" | "branch";
  timestamp: string;
  details?: any;
}

@WSGateway({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  namespace: "/mobile",
})
export class WebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketGateway.name);
  private connectedClients: Map<string, Socket> = new Map();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);

    // Send welcome message
    client.emit("connected", {
      message: "Connected to Cursor Mobile Backend",
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage("join_project")
  handleJoinProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectPath: string }
  ) {
    this.logger.log(`Client ${client.id} joined project: ${data.projectPath}`);
    client.join(`project:${data.projectPath}`);

    client.emit("joined_project", {
      projectPath: data.projectPath,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage("leave_project")
  handleLeaveProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectPath: string }
  ) {
    this.logger.log(`Client ${client.id} left project: ${data.projectPath}`);
    client.leave(`project:${data.projectPath}`);

    client.emit("left_project", {
      projectPath: data.projectPath,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage("subscribe_file_changes")
  handleSubscribeFileChanges(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectPath: string }
  ) {
    this.logger.log(
      `Client ${client.id} subscribed to file changes: ${data.projectPath}`
    );
    client.join(`file_changes:${data.projectPath}`);

    client.emit("subscribed_file_changes", {
      projectPath: data.projectPath,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage("unsubscribe_file_changes")
  handleUnsubscribeFileChanges(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectPath: string }
  ) {
    this.logger.log(
      `Client ${client.id} unsubscribed from file changes: ${data.projectPath}`
    );
    client.leave(`file_changes:${data.projectPath}`);

    client.emit("unsubscribed_file_changes", {
      projectPath: data.projectPath,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage("subscribe_cursor_updates")
  handleSubscribeCursorUpdates(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectPath?: string }
  ) {
    this.logger.log(`Client ${client.id} subscribed to Cursor updates`);
    client.join("cursor_updates");

    if (data.projectPath) {
      client.join(`cursor_updates:${data.projectPath}`);
    }

    client.emit("subscribed_cursor_updates", {
      projectPath: data.projectPath,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage("unsubscribe_cursor_updates")
  handleUnsubscribeCursorUpdates(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectPath?: string }
  ) {
    this.logger.log(`Client ${client.id} unsubscribed from Cursor updates`);
    client.leave("cursor_updates");

    if (data.projectPath) {
      client.leave(`cursor_updates:${data.projectPath}`);
    }

    client.emit("unsubscribed_cursor_updates", {
      projectPath: data.projectPath,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage("ping")
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit("pong", {
      timestamp: new Date().toISOString(),
    });
  }

  // Public methods for emitting events from services
  emitFileChange(event: FileChangeEvent) {
    this.server
      .to(`file_changes:${event.projectPath}`)
      .emit("file_change", event);
    this.logger.debug(
      `Emitted file change event: ${event.event} - ${event.filePath}`
    );
  }

  emitCursorUpdate(event: CursorUpdateEvent) {
    this.server.to("cursor_updates").emit("cursor_update", event);
    this.logger.debug(
      `Emitted Cursor update event: ${event.id} - ${event.status}`
    );
  }

  emitProjectUpdate(event: ProjectUpdateEvent) {
    this.server
      .to(`project:${event.projectPath}`)
      .emit("project_update", event);
    this.server.emit("project_list_update", event);
    this.logger.debug(
      `Emitted project update event: ${event.action} - ${event.projectPath}`
    );
  }

  emitGitUpdate(event: GitUpdateEvent) {
    this.server.to(`project:${event.projectPath}`).emit("git_update", event);
    this.logger.debug(
      `Emitted Git update event: ${event.action} - ${event.projectPath}`
    );
  }

  emitCustomEvent(event: string, data: any, room?: string) {
    if (room) {
      this.server.to(room).emit(event, data);
    } else {
      this.server.emit(event, data);
    }
    this.logger.debug(
      `Emitted custom event: ${event} to ${room || "all clients"}`
    );
  }

  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  getConnectedClients(): string[] {
    return Array.from(this.connectedClients.keys());
  }

  isClientConnected(clientId: string): boolean {
    return this.connectedClients.has(clientId);
  }
}
