import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { spawn, ChildProcess } from "child_process";
import * as net from "net";
import { DevServerDto } from "./dto/preview.dto";
import { WebSocketGateway } from "../websocket/websocket.gateway";

@Injectable()
export class DevServerWatcherService {
  private readonly logger = new Logger(DevServerWatcherService.name);
  private readonly defaultPorts: number[];
  private devServers: Map<string, DevServerDto> = new Map();
  private processes: Map<string, ChildProcess> = new Map();

  constructor(
    private configService: ConfigService,
    private webSocketGateway: WebSocketGateway
  ) {
    const portsString =
      this.configService.get<string>("DEFAULT_DEV_PORTS") ||
      "3000,3001,8080,8000,5000";
    this.defaultPorts = portsString.split(",").map((p) => parseInt(p.trim()));
  }

  async detectRunningServers(projectPath: string): Promise<DevServerDto[]> {
    const servers: DevServerDto[] = [];

    for (const port of this.defaultPorts) {
      if (await this.isPortInUse(port)) {
        const server: DevServerDto = {
          projectPath,
          name: `Dev Server (Port ${port})`,
          url: `http://localhost:${port}`,
          port,
          status: "running",
          lastStarted: new Date().toISOString(),
        };

        servers.push(server);
        this.devServers.set(`${projectPath}:${port}`, server);
      }
    }

    return servers;
  }

  async startDevServer(
    projectPath: string,
    command?: string,
    port?: number,
    framework?: string
  ): Promise<DevServerDto> {
    const serverId = `${projectPath}:${port || "auto"}`;

    if (this.devServers.has(serverId)) {
      throw new Error("Dev server already running for this project");
    }

    const detectedCommand =
      command || (await this.detectDevCommand(projectPath, framework));
    const detectedPort = port || (await this.findAvailablePort());

    const server: DevServerDto = {
      projectPath,
      name: `Dev Server (${framework || "Unknown"})`,
      url: `http://localhost:${detectedPort}`,
      port: detectedPort,
      status: "starting",
      command: detectedCommand,
      workingDirectory: projectPath,
      lastStarted: new Date().toISOString(),
      framework,
    };

    this.devServers.set(serverId, server);

    try {
      const process = await this.spawnDevServer(
        projectPath,
        detectedCommand,
        detectedPort
      );
      this.processes.set(serverId, process);

      server.status = "running";
      server.pid = process.pid?.toString();

      this.webSocketGateway.emitCustomEvent(
        "dev_server_started",
        server,
        `project:${projectPath}`
      );

      return server;
    } catch (error) {
      this.logger.error(`Failed to start dev server:`, error);
      server.status = "error";
      this.devServers.set(serverId, server);
      throw error;
    }
  }

  async stopDevServer(projectPath: string, serverId?: string): Promise<void> {
    const key = serverId || `${projectPath}:auto`;
    const process = this.processes.get(key);

    if (process) {
      process.kill();
      this.processes.delete(key);
    }

    const server = this.devServers.get(key);
    if (server) {
      server.status = "stopped";
      this.webSocketGateway.emitCustomEvent(
        "dev_server_stopped",
        server,
        `project:${projectPath}`
      );
    }
  }

  async getDevServers(projectPath?: string): Promise<DevServerDto[]> {
    if (projectPath) {
      return Array.from(this.devServers.values()).filter(
        (s) => s.projectPath === projectPath
      );
    }
    return Array.from(this.devServers.values());
  }

  async isPortInUse(
    port: number,
    host: string = "localhost"
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const server = net.createServer();

      server.listen(port, host, () => {
        server.close(() => resolve(false));
      });

      server.on("error", () => resolve(true));
    });
  }

  private async findAvailablePort(): Promise<number> {
    for (const port of this.defaultPorts) {
      if (!(await this.isPortInUse(port))) {
        return port;
      }
    }

    // If no default port is available, find any available port
    return new Promise((resolve) => {
      const server = net.createServer();
      server.listen(0, () => {
        const port = (server.address() as net.AddressInfo).port;
        server.close(() => resolve(port));
      });
    });
  }

  private async detectDevCommand(
    projectPath: string,
    framework?: string
  ): Promise<string> {
    const packageJsonPath = `${projectPath}/package.json`;

    try {
      const packageJson = JSON.parse(
        require("fs").readFileSync(packageJsonPath, "utf8")
      );
      const scripts = packageJson.scripts || {};

      // Framework-specific commands
      if (framework) {
        switch (framework.toLowerCase()) {
          case "react":
          case "next":
            return scripts.dev || scripts.start || "npm run dev";
          case "vue":
          case "nuxt":
            return scripts.dev || scripts.serve || "npm run dev";
          case "angular":
            return scripts.serve || scripts.start || "ng serve";
          case "svelte":
            return scripts.dev || scripts.start || "npm run dev";
        }
      }

      // Common dev commands
      if (scripts.dev) return "npm run dev";
      if (scripts.start) return "npm run start";
      if (scripts.serve) return "npm run serve";

      // Fallback
      return "npm run dev";
    } catch {
      return "npm run dev";
    }
  }

  private async spawnDevServer(
    projectPath: string,
    command: string,
    port: number
  ): Promise<ChildProcess> {
    return new Promise((resolve, reject) => {
      const [cmd, ...args] = command.split(" ");

      const childProcess = spawn(cmd, args, {
        cwd: projectPath,
        stdio: ["pipe", "pipe", "pipe"],
        env: {
          ...process.env,
          PORT: port.toString(),
        },
      });

      let resolved = false;

      childProcess.stdout.on("data", (data) => {
        const output = data.toString();
        this.logger.debug(`Dev server output: ${output}`);

        // Check for common success indicators
        if (
          output.includes("Local:") ||
          output.includes("ready") ||
          output.includes("started")
        ) {
          if (!resolved) {
            resolved = true;
            resolve(childProcess);
          }
        }
      });

      childProcess.stderr.on("data", (data) => {
        const error = data.toString();
        this.logger.error(`Dev server error: ${error}`);
      });

      childProcess.on("error", (error) => {
        if (!resolved) {
          resolved = true;
          reject(error);
        }
      });

      childProcess.on("exit", (code) => {
        this.logger.log(`Dev server exited with code ${code}`);
        const serverId = `${projectPath}:${port}`;
        this.processes.delete(serverId);

        const server = this.devServers.get(serverId);
        if (server) {
          server.status = "stopped";
        }
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(childProcess);
        }
      }, 30000);
    });
  }
}
