import { Injectable, Logger } from "@nestjs/common";
import { DevServerWatcherService } from "./dev-server-watcher.service";
import {
  DevServerDto,
  StartDevServerDto,
  StopDevServerDto,
  PortCheckDto,
} from "./dto/preview.dto";

@Injectable()
export class PreviewService {
  private readonly logger = new Logger(PreviewService.name);

  constructor(private devServerWatcher: DevServerWatcherService) {}

  async detectRunningServers(projectPath: string): Promise<DevServerDto[]> {
    return await this.devServerWatcher.detectRunningServers(projectPath);
  }

  async startDevServer(startDto: StartDevServerDto): Promise<DevServerDto> {
    return await this.devServerWatcher.startDevServer(
      startDto.projectPath,
      startDto.command,
      startDto.port,
      startDto.framework
    );
  }

  async stopDevServer(stopDto: StopDevServerDto): Promise<{ message: string }> {
    await this.devServerWatcher.stopDevServer(
      stopDto.projectPath,
      stopDto.serverId
    );
    return { message: "Dev server stopped successfully" };
  }

  async getDevServers(projectPath?: string): Promise<DevServerDto[]> {
    return await this.devServerWatcher.getDevServers(projectPath);
  }

  async checkPort(
    portCheck: PortCheckDto
  ): Promise<{ port: number; inUse: boolean; url?: string }> {
    const inUse = await this.devServerWatcher.isPortInUse(
      portCheck.port,
      portCheck.host
    );
    return {
      port: portCheck.port,
      inUse,
      url: inUse
        ? `http://${portCheck.host || "localhost"}:${portCheck.port}`
        : undefined,
    };
  }

  async getAvailablePorts(): Promise<number[]> {
    const availablePorts: number[] = [];
    const defaultPorts = [3000, 3001, 8080, 8000, 5000, 4000, 9000];

    for (const port of defaultPorts) {
      const inUse = await this.devServerWatcher.isPortInUse(port);
      if (!inUse) {
        availablePorts.push(port);
      }
    }

    return availablePorts;
  }

  async getServerStatus(projectPath: string): Promise<{
    projectPath: string;
    servers: DevServerDto[];
    totalRunning: number;
    availablePorts: number[];
  }> {
    const servers = await this.devServerWatcher.getDevServers(projectPath);
    const runningServers = servers.filter((s) => s.status === "running");
    const availablePorts = await this.getAvailablePorts();

    return {
      projectPath,
      servers,
      totalRunning: runningServers.length,
      availablePorts,
    };
  }
}
