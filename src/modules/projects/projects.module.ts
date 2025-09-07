import { Module } from "@nestjs/common";
import { ProjectsController } from "./projects.controller";
import { ProjectsService } from "./projects.service";
import { FileWatcherService } from "./file-watcher.service";
import { WebSocketModule } from "../websocket/websocket.module";

@Module({
  imports: [WebSocketModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, FileWatcherService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
