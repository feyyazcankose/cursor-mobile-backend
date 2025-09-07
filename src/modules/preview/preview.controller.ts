import { Controller, Get, Post, Body, Query, Param } from "@nestjs/common";
import { PreviewService } from "./preview.service";
import {
  StartDevServerDto,
  StopDevServerDto,
  PortCheckDto,
} from "./dto/preview.dto";

@Controller("preview")
export class PreviewController {
  constructor(private readonly previewService: PreviewService) {}

  @Get("detect/:projectPath(*)")
  async detectRunningServers(@Param("projectPath") projectPath: string) {
    const decodedPath = decodeURIComponent(projectPath);
    return await this.previewService.detectRunningServers(decodedPath);
  }

  @Post("start")
  async startDevServer(@Body() body: StartDevServerDto) {
    return await this.previewService.startDevServer(body);
  }

  @Post("stop")
  async stopDevServer(@Body() body: StopDevServerDto) {
    return await this.previewService.stopDevServer(body);
  }

  @Get("servers")
  async getDevServers(@Query("projectPath") projectPath?: string) {
    return await this.previewService.getDevServers(projectPath);
  }

  @Get("status/:projectPath(*)")
  async getServerStatus(@Param("projectPath") projectPath: string) {
    const decodedPath = decodeURIComponent(projectPath);
    return await this.previewService.getServerStatus(decodedPath);
  }

  @Get("ports/available")
  async getAvailablePorts() {
    return await this.previewService.getAvailablePorts();
  }

  @Post("ports/check")
  async checkPort(@Body() body: PortCheckDto) {
    return await this.previewService.checkPort(body);
  }
}
