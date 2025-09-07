import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { spawn, ChildProcess } from "child_process";
import * as fs from "fs";
import * as path from "path";
import {
  CursorPromptDto,
  CursorCommandDto,
  CursorOpenDto,
  CursorResponse,
} from "./dto/cursor.dto";
import { WebSocketGateway } from "../websocket/websocket.gateway";

@Injectable()
export class CursorService {
  private readonly logger = new Logger(CursorService.name);
  private readonly cursorCliPath: string;
  private activeProcesses: Map<string, ChildProcess> = new Map();
  private responses: Map<string, CursorResponse> = new Map();

  constructor(
    private configService: ConfigService,
    private webSocketGateway: WebSocketGateway
  ) {
    this.cursorCliPath =
      this.configService.get<string>("CURSOR_CLI_PATH") ||
      "/usr/local/bin/cursor";
  }

  async executePrompt(promptDto: CursorPromptDto): Promise<CursorResponse> {
    const responseId = this.generateResponseId();
    const startTime = Date.now();

    const response: CursorResponse = {
      id: responseId,
      status: "pending",
      timestamp: new Date().toISOString(),
    };

    this.responses.set(responseId, response);

    try {
      // Check if Cursor CLI is available
      if (!(await this.isCursorCliAvailable())) {
        throw new BadRequestException(
          "Cursor CLI not found. Please install Cursor and ensure it's in your PATH."
        );
      }

      // Check if project path exists
      if (!(await this.pathExists(promptDto.projectPath))) {
        throw new BadRequestException(
          `Project path does not exist: ${promptDto.projectPath}`
        );
      }

      response.status = "running";
      this.responses.set(responseId, response);
      this.webSocketGateway.emitCursorUpdate(response);

      // Build Cursor CLI command
      const args = ["--command", promptDto.prompt];

      if (promptDto.context) {
        args.push("--context", promptDto.context);
      }

      if (promptDto.files && promptDto.files.length > 0) {
        args.push("--files", promptDto.files.join(","));
      }

      if (promptDto.openInCursor) {
        args.push("--open");
      }

      args.push(promptDto.projectPath);

      // Execute command
      const result = await this.executeCommandInternal(
        this.cursorCliPath,
        args,
        promptDto.projectPath
      );

      response.status = "completed";
      response.result = result;
      response.duration = Date.now() - startTime;
      response.timestamp = new Date().toISOString();

      this.responses.set(responseId, response);
      this.webSocketGateway.emitCursorUpdate(response);

      return response;
    } catch (error) {
      this.logger.error(`Error executing prompt:`, error);

      response.status = "error";
      response.error = error.message;
      response.duration = Date.now() - startTime;
      response.timestamp = new Date().toISOString();

      this.responses.set(responseId, response);
      this.webSocketGateway.emitCursorUpdate(response);

      return response;
    }
  }

  async executeCommand(commandDto: CursorCommandDto): Promise<CursorResponse> {
    const responseId = this.generateResponseId();
    const startTime = Date.now();

    const response: CursorResponse = {
      id: responseId,
      status: "pending",
      timestamp: new Date().toISOString(),
    };

    this.responses.set(responseId, response);

    try {
      response.status = "running";
      this.responses.set(responseId, response);
      this.webSocketGateway.emitCursorUpdate(response);

      const workingDir = commandDto.workingDirectory || commandDto.projectPath;
      const args = commandDto.args || [];

      const result = await this.executeCommandInternal(
        commandDto.command,
        args,
        workingDir
      );

      response.status = "completed";
      response.result = result;
      response.duration = Date.now() - startTime;
      response.timestamp = new Date().toISOString();

      this.responses.set(responseId, response);
      this.webSocketGateway.emitCursorUpdate(response);

      return response;
    } catch (error) {
      this.logger.error(`Error executing command:`, error);

      response.status = "error";
      response.error = error.message;
      response.duration = Date.now() - startTime;
      response.timestamp = new Date().toISOString();

      this.responses.set(responseId, response);
      this.webSocketGateway.emitCursorUpdate(response);

      return response;
    }
  }

  async openInCursor(openDto: CursorOpenDto): Promise<{ message: string }> {
    try {
      if (!(await this.isCursorCliAvailable())) {
        throw new BadRequestException("Cursor CLI not found");
      }

      const args = [openDto.projectPath];

      if (openDto.file) {
        args.push(openDto.file);

        if (openDto.line) {
          args.push("--line", openDto.line.toString());
        }

        if (openDto.column) {
          args.push("--column", openDto.column.toString());
        }
      }

      // Open Cursor (non-blocking)
      this.executeCommandInternal(
        this.cursorCliPath,
        args,
        openDto.projectPath,
        false
      );

      return { message: "Opening in Cursor..." };
    } catch (error) {
      this.logger.error(`Error opening in Cursor:`, error);
      throw new BadRequestException(
        `Failed to open in Cursor: ${error.message}`
      );
    }
  }

  async getResponse(responseId: string): Promise<CursorResponse | null> {
    return this.responses.get(responseId) || null;
  }

  async getAllResponses(): Promise<CursorResponse[]> {
    return Array.from(this.responses.values());
  }

  async getActiveProcesses(): Promise<string[]> {
    return Array.from(this.activeProcesses.keys());
  }

  async cancelProcess(responseId: string): Promise<{ message: string }> {
    const process = this.activeProcesses.get(responseId);
    if (process) {
      process.kill();
      this.activeProcesses.delete(responseId);

      const response = this.responses.get(responseId);
      if (response) {
        response.status = "error";
        response.error = "Process cancelled by user";
        response.timestamp = new Date().toISOString();
        this.responses.set(responseId, response);
        this.webSocketGateway.emitCursorUpdate(response);
      }

      return { message: "Process cancelled" };
    }

    throw new BadRequestException("Process not found or already completed");
  }

  private async executeCommandInternal(
    command: string,
    args: string[],
    workingDir: string,
    waitForCompletion: boolean = true
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, {
        cwd: workingDir,
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      process.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      process.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      process.on("close", (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });

      process.on("error", (error) => {
        reject(new Error(`Command execution failed: ${error.message}`));
      });

      if (!waitForCompletion) {
        resolve("Process started");
      }
    });
  }

  private async isCursorCliAvailable(): Promise<boolean> {
    try {
      await this.executeCommandInternal(
        "which",
        [this.cursorCliPath],
        process.cwd()
      );
      return true;
    } catch {
      return false;
    }
  }

  private async pathExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private generateResponseId(): string {
    return `cursor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Clean up old responses periodically
  private cleanupOldResponses(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    for (const [id, response] of this.responses) {
      const responseTime = new Date(response.timestamp).getTime();
      if (responseTime < oneHourAgo) {
        this.responses.delete(id);
      }
    }
  }
}
