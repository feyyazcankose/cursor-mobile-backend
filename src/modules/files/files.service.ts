import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs";
import * as path from "path";
import { FileDto, FileContentDto, FileWriteDto } from "./dto/file.dto";

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly maxFileSize: number;

  constructor(private configService: ConfigService) {
    this.maxFileSize =
      this.configService.get<number>("MAX_FILE_SIZE") || 10485760; // 10MB
  }

  async getFileList(
    projectPath: string,
    directoryPath: string = ""
  ): Promise<FileDto[]> {
    const fullPath = path.join(projectPath, directoryPath);

    if (!(await this.pathExists(fullPath))) {
      throw new NotFoundException(`Directory not found: ${directoryPath}`);
    }

    const stats = await fs.promises.stat(fullPath);
    if (!stats.isDirectory()) {
      throw new BadRequestException(
        `Path is not a directory: ${directoryPath}`
      );
    }

    try {
      const entries = await fs.promises.readdir(fullPath, {
        withFileTypes: true,
      });
      const files: FileDto[] = [];

      for (const entry of entries) {
        // Skip hidden files and common ignore directories
        if (
          entry.name.startsWith(".") &&
          ![".gitignore", ".env", ".env.example"].includes(entry.name)
        ) {
          continue;
        }

        if (
          ["node_modules", "dist", "build", ".next", "coverage"].includes(
            entry.name
          )
        ) {
          continue;
        }

        const entryPath = path.join(fullPath, entry.name);
        const relativePath = path
          .join(directoryPath, entry.name)
          .replace(/\\/g, "/");

        const fileInfo: FileDto = {
          name: entry.name,
          path: entryPath,
          relativePath,
          isDirectory: entry.isDirectory(),
          type: this.getFileType(entry.name),
          language: this.detectLanguage(entry.name),
        };

        if (!entry.isDirectory()) {
          const stats = await fs.promises.stat(entryPath);
          fileInfo.size = stats.size;
          fileInfo.lastModified = stats.mtime.toISOString();
        }

        files.push(fileInfo);
      }

      // Sort: directories first, then files, both alphabetically
      files.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });

      return files;
    } catch (error) {
      this.logger.error(`Error reading directory ${fullPath}:`, error);
      throw new BadRequestException(
        `Failed to read directory: ${error.message}`
      );
    }
  }

  async getFileContent(
    projectPath: string,
    filePath: string
  ): Promise<FileDto> {
    const fullPath = path.join(projectPath, filePath);

    if (!(await this.pathExists(fullPath))) {
      throw new NotFoundException(`File not found: ${filePath}`);
    }

    const stats = await fs.promises.stat(fullPath);
    if (stats.isDirectory()) {
      throw new BadRequestException(
        `Path is a directory, not a file: ${filePath}`
      );
    }

    if (stats.size > this.maxFileSize) {
      throw new BadRequestException(
        `File too large: ${stats.size} bytes (max: ${this.maxFileSize})`
      );
    }

    try {
      const content = await fs.promises.readFile(fullPath, "utf8");
      const relativePath = path
        .relative(projectPath, fullPath)
        .replace(/\\/g, "/");

      return {
        name: path.basename(fullPath),
        path: fullPath,
        relativePath,
        content,
        type: this.getFileType(filePath),
        size: stats.size,
        lastModified: stats.mtime.toISOString(),
        isDirectory: false,
        language: this.detectLanguage(filePath),
      };
    } catch (error) {
      this.logger.error(`Error reading file ${fullPath}:`, error);
      throw new BadRequestException(`Failed to read file: ${error.message}`);
    }
  }

  async writeFile(
    projectPath: string,
    filePath: string,
    content: string
  ): Promise<FileDto> {
    const fullPath = path.join(projectPath, filePath);

    try {
      // Ensure directory exists
      const dir = path.dirname(fullPath);
      await fs.promises.mkdir(dir, { recursive: true });

      // Write file
      await fs.promises.writeFile(fullPath, content, "utf8");

      // Return updated file info
      const stats = await fs.promises.stat(fullPath);
      const relativePath = path
        .relative(projectPath, fullPath)
        .replace(/\\/g, "/");

      return {
        name: path.basename(fullPath),
        path: fullPath,
        relativePath,
        content,
        type: this.getFileType(filePath),
        size: stats.size,
        lastModified: stats.mtime.toISOString(),
        isDirectory: false,
        language: this.detectLanguage(filePath),
      };
    } catch (error) {
      this.logger.error(`Error writing file ${fullPath}:`, error);
      throw new BadRequestException(`Failed to write file: ${error.message}`);
    }
  }

  async deleteFile(projectPath: string, filePath: string): Promise<void> {
    const fullPath = path.join(projectPath, filePath);

    if (!(await this.pathExists(fullPath))) {
      throw new NotFoundException(`File not found: ${filePath}`);
    }

    try {
      const stats = await fs.promises.stat(fullPath);
      if (stats.isDirectory()) {
        await fs.promises.rmdir(fullPath, { recursive: true });
      } else {
        await fs.promises.unlink(fullPath);
      }
    } catch (error) {
      this.logger.error(`Error deleting ${fullPath}:`, error);
      throw new BadRequestException(`Failed to delete: ${error.message}`);
    }
  }

  async createDirectory(
    projectPath: string,
    dirPath: string
  ): Promise<FileDto> {
    const fullPath = path.join(projectPath, dirPath);

    if (await this.pathExists(fullPath)) {
      throw new BadRequestException(`Directory already exists: ${dirPath}`);
    }

    try {
      await fs.promises.mkdir(fullPath, { recursive: true });
      const relativePath = path
        .relative(projectPath, fullPath)
        .replace(/\\/g, "/");

      return {
        name: path.basename(fullPath),
        path: fullPath,
        relativePath,
        isDirectory: true,
        type: "directory",
      };
    } catch (error) {
      this.logger.error(`Error creating directory ${fullPath}:`, error);
      throw new BadRequestException(
        `Failed to create directory: ${error.message}`
      );
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

  private getFileType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();

    const typeMap: { [key: string]: string } = {
      ".js": "javascript",
      ".ts": "typescript",
      ".jsx": "javascript",
      ".tsx": "typescript",
      ".py": "python",
      ".java": "java",
      ".go": "go",
      ".rs": "rust",
      ".php": "php",
      ".rb": "ruby",
      ".css": "css",
      ".scss": "scss",
      ".sass": "sass",
      ".less": "less",
      ".html": "html",
      ".htm": "html",
      ".xml": "xml",
      ".json": "json",
      ".yaml": "yaml",
      ".yml": "yaml",
      ".md": "markdown",
      ".txt": "text",
      ".sql": "sql",
      ".sh": "shell",
      ".bat": "batch",
      ".ps1": "powershell",
      ".dockerfile": "dockerfile",
      ".gitignore": "gitignore",
      ".env": "env",
    };

    return typeMap[ext] || "text";
  }

  private detectLanguage(fileName: string): string | undefined {
    const ext = path.extname(fileName).toLowerCase();

    const languageMap: { [key: string]: string } = {
      ".js": "javascript",
      ".ts": "typescript",
      ".jsx": "javascript",
      ".tsx": "typescript",
      ".py": "python",
      ".java": "java",
      ".go": "go",
      ".rs": "rust",
      ".php": "php",
      ".rb": "ruby",
      ".css": "css",
      ".scss": "scss",
      ".sass": "sass",
      ".less": "less",
      ".html": "html",
      ".htm": "html",
      ".xml": "xml",
      ".json": "json",
      ".yaml": "yaml",
      ".yml": "yaml",
      ".md": "markdown",
      ".sql": "sql",
      ".sh": "shell",
      ".bat": "batch",
      ".ps1": "powershell",
    };

    return languageMap[ext];
  }
}
