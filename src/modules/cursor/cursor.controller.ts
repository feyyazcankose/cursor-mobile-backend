import { Controller, Get, Post, Body, Param, Query } from "@nestjs/common";
import { CursorService } from "./cursor.service";
import {
  CursorPromptDto,
  CursorCommandDto,
  CursorOpenDto,
} from "./dto/cursor.dto";

@Controller("cursor")
export class CursorController {
  constructor(private readonly cursorService: CursorService) {}

  @Post("prompt")
  async executePrompt(@Body() body: CursorPromptDto) {
    return await this.cursorService.executePrompt(body);
  }

  @Post("command")
  async executeCommand(@Body() body: CursorCommandDto) {
    return await this.cursorService.executeCommand(body);
  }

  @Post("open")
  async openInCursor(@Body() body: CursorOpenDto) {
    return await this.cursorService.openInCursor(body);
  }

  @Get("response/:id")
  async getResponse(@Param("id") responseId: string) {
    return await this.cursorService.getResponse(responseId);
  }

  @Get("responses")
  async getAllResponses() {
    return await this.cursorService.getAllResponses();
  }

  @Get("processes")
  async getActiveProcesses() {
    return await this.cursorService.getActiveProcesses();
  }

  @Post("cancel/:id")
  async cancelProcess(@Param("id") responseId: string) {
    return await this.cursorService.cancelProcess(responseId);
  }
}
