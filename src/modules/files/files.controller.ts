import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
} from "@nestjs/common";
import { FilesService } from "./files.service";
import {
  FileDto,
  FileListDto,
  FileContentDto,
  FileWriteDto,
} from "./dto/file.dto";

@Controller("files")
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get("list")
  async getFileList(@Query() query: FileListDto): Promise<FileDto[]> {
    return await this.filesService.getFileList(
      query.projectPath,
      query.directoryPath
    );
  }

  @Get("content")
  async getFileContent(@Query() query: FileContentDto): Promise<FileDto> {
    return await this.filesService.getFileContent(
      query.projectPath,
      query.filePath
    );
  }

  @Post("write")
  async writeFile(@Body() body: FileWriteDto): Promise<FileDto> {
    return await this.filesService.writeFile(
      body.projectPath,
      body.filePath,
      body.content
    );
  }

  @Delete(":projectPath(*)/:filePath(*)")
  async deleteFile(
    @Param("projectPath") projectPath: string,
    @Param("filePath") filePath: string
  ): Promise<{ message: string }> {
    const decodedProjectPath = decodeURIComponent(projectPath);
    const decodedFilePath = decodeURIComponent(filePath);
    await this.filesService.deleteFile(decodedProjectPath, decodedFilePath);
    return { message: "File deleted successfully" };
  }

  @Post("directory")
  async createDirectory(
    @Body() body: { projectPath: string; dirPath: string }
  ): Promise<FileDto> {
    return await this.filesService.createDirectory(
      body.projectPath,
      body.dirPath
    );
  }
}
