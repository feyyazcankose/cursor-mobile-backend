import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as chokidar from "chokidar";
import { WebSocketGateway } from "../websocket/websocket.gateway";

@Injectable()
export class FileWatcherService {
  private readonly logger = new Logger(FileWatcherService.name);
  private watchers: Map<string, chokidar.FSWatcher> = new Map();
  private readonly workspacePath: string;

  constructor(
    private configService: ConfigService,
    private webSocketGateway: WebSocketGateway
  ) {
    this.workspacePath =
      this.configService.get<string>("CURSOR_WORKSPACE_PATH") ||
      "/Users/feyyazcankose/Workspace";
  }

  async watchProject(projectPath: string): Promise<void> {
    if (this.watchers.has(projectPath)) {
      return; // Already watching
    }

    try {
      const watcher = chokidar.watch(projectPath, {
        ignored: [
          /(^|[\/\\])\../, // ignore dotfiles
          /node_modules/,
          /\.git/,
          /dist/,
          /build/,
          /\.next/,
          /coverage/,
          /\.nyc_output/,
        ],
        persistent: true,
        ignoreInitial: true,
      });

      watcher
        .on("add", (filePath) =>
          this.handleFileChange("add", filePath, projectPath)
        )
        .on("change", (filePath) =>
          this.handleFileChange("change", filePath, projectPath)
        )
        .on("unlink", (filePath) =>
          this.handleFileChange("unlink", filePath, projectPath)
        )
        .on("error", (error) =>
          this.logger.error(`Watcher error for ${projectPath}:`, error)
        );

      this.watchers.set(projectPath, watcher);
      this.logger.log(`Started watching project: ${projectPath}`);
    } catch (error) {
      this.logger.error(`Failed to start watching ${projectPath}:`, error);
    }
  }

  async unwatchProject(projectPath: string): Promise<void> {
    const watcher = this.watchers.get(projectPath);
    if (watcher) {
      await watcher.close();
      this.watchers.delete(projectPath);
      this.logger.log(`Stopped watching project: ${projectPath}`);
    }
  }

  async watchAllProjects(projectPaths: string[]): Promise<void> {
    for (const projectPath of projectPaths) {
      await this.watchProject(projectPath);
    }
  }

  async stopAllWatchers(): Promise<void> {
    for (const [projectPath, watcher] of this.watchers) {
      await watcher.close();
      this.logger.log(`Stopped watching project: ${projectPath}`);
    }
    this.watchers.clear();
  }

  private handleFileChange(
    event: "add" | "change" | "unlink",
    filePath: string,
    projectPath: string
  ): void {
    const relativePath = filePath.replace(projectPath + "/", "");

    this.logger.debug(`File ${event}: ${relativePath}`);

    // Emit WebSocket event to connected clients
    this.webSocketGateway.emitFileChange({
      event,
      filePath: relativePath,
      projectPath,
      timestamp: new Date().toISOString(),
    });
  }

  getWatchedProjects(): string[] {
    return Array.from(this.watchers.keys());
  }
}
