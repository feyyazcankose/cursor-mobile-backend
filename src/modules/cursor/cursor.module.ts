import { Module } from "@nestjs/common";
import { CursorController } from "./cursor.controller";
import { CursorService } from "./cursor.service";
import { WebSocketModule } from "../websocket/websocket.module";

@Module({
  imports: [WebSocketModule],
  controllers: [CursorController],
  providers: [CursorService],
  exports: [CursorService],
})
export class CursorModule {}
