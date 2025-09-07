import { Module } from "@nestjs/common";
import { PreviewController } from "./preview.controller";
import { PreviewService } from "./preview.service";
import { DevServerWatcherService } from "./dev-server-watcher.service";
import { WebSocketModule } from "../websocket/websocket.module";

@Module({
  imports: [WebSocketModule],
  controllers: [PreviewController],
  providers: [PreviewService, DevServerWatcherService],
  exports: [PreviewService],
})
export class PreviewModule {}
