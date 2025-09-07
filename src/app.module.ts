import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { ProjectsModule } from "./modules/projects/projects.module";
import { FilesModule } from "./modules/files/files.module";
import { GitModule } from "./modules/git/git.module";
import { CursorModule } from "./modules/cursor/cursor.module";
import { PreviewModule } from "./modules/preview/preview.module";
import { WebSocketModule } from "./modules/websocket/websocket.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    ScheduleModule.forRoot(),
    ProjectsModule,
    FilesModule,
    GitModule,
    CursorModule,
    PreviewModule,
    WebSocketModule,
  ],
})
export class AppModule {}
