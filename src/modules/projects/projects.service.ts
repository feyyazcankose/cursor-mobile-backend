import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs";
import * as path from "path";
import { ProjectDto } from "./dto/project.dto";
import { FileWatcherService } from "./file-watcher.service";

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);
  private readonly workspacePath: string;
  private projects: Map<string, ProjectDto> = new Map();

  constructor(
    private configService: ConfigService,
    private fileWatcherService: FileWatcherService
  ) {
    this.workspacePath =
      this.configService.get<string>("CURSOR_WORKSPACE_PATH") ||
      "/Users/feyyazcankose/Workspace";
    this.initializeProjects();
  }

  private async initializeProjects() {
    try {
      await this.scanWorkspace();
      this.logger.log(`Found ${this.projects.size} projects in workspace`);
    } catch (error) {
      this.logger.error("Failed to initialize projects:", error);
    }
  }

  async scanWorkspace(): Promise<ProjectDto[]> {
    const projects: ProjectDto[] = [];

    try {
      const entries = await fs.promises.readdir(this.workspacePath, {
        withFileTypes: true,
      });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const projectPath = path.join(this.workspacePath, entry.name);
          const project = await this.analyzeProject(projectPath, entry.name);
          if (project) {
            projects.push(project);
            this.projects.set(projectPath, project);
          }
        }
      }
    } catch (error) {
      this.logger.error("Error scanning workspace:", error);
    }

    return projects;
  }

  private async analyzeProject(
    projectPath: string,
    name: string
  ): Promise<ProjectDto | null> {
    try {
      const stats = await fs.promises.stat(projectPath);

      // Check if it's a valid project directory
      const packageJsonPath = path.join(projectPath, "package.json");
      const gitPath = path.join(projectPath, ".git");
      const hasPackageJson = await this.fileExists(packageJsonPath);
      const hasGit = await this.fileExists(gitPath);

      if (!hasPackageJson && !hasGit) {
        return null; // Skip non-project directories
      }

      const project: ProjectDto = {
        name,
        path: projectPath,
        lastModified: stats.mtime.toISOString(),
        fileCount: await this.countFiles(projectPath),
        gitBranch: await this.getGitBranch(projectPath),
        gitStatus: await this.getGitStatus(projectPath),
        language: await this.detectLanguage(projectPath),
        framework: await this.detectFramework(projectPath),
      };

      return project;
    } catch (error) {
      this.logger.error(`Error analyzing project ${projectPath}:`, error);
      return null;
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private async countFiles(dirPath: string): Promise<number> {
    let count = 0;
    try {
      const entries = await fs.promises.readdir(dirPath, {
        withFileTypes: true,
      });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          // Skip common ignore directories
          if (
            ["node_modules", ".git", "dist", "build", ".next"].includes(
              entry.name
            )
          ) {
            continue;
          }
          count += await this.countFiles(path.join(dirPath, entry.name));
        } else {
          count++;
        }
      }
    } catch (error) {
      this.logger.error(`Error counting files in ${dirPath}:`, error);
    }

    return count;
  }

  private async getGitBranch(projectPath: string): Promise<string | undefined> {
    try {
      const gitPath = path.join(projectPath, ".git");
      if (!(await this.fileExists(gitPath))) return undefined;

      const headPath = path.join(gitPath, "HEAD");
      const headContent = await fs.promises.readFile(headPath, "utf8");
      const branch = headContent.replace("ref: refs/heads/", "").trim();
      return branch;
    } catch {
      return undefined;
    }
  }

  private async getGitStatus(projectPath: string): Promise<string | undefined> {
    try {
      const gitPath = path.join(projectPath, ".git");
      if (!(await this.fileExists(gitPath))) return undefined;

      // Simple git status check - could be enhanced with actual git commands
      return "clean"; // Placeholder
    } catch {
      return undefined;
    }
  }

  private async detectLanguage(
    projectPath: string
  ): Promise<string | undefined> {
    try {
      const packageJsonPath = path.join(projectPath, "package.json");
      if (await this.fileExists(packageJsonPath)) {
        return "javascript";
      }

      const pyFiles = await this.findFilesByExtension(projectPath, [".py"]);
      if (pyFiles.length > 0) return "python";

      const javaFiles = await this.findFilesByExtension(projectPath, [".java"]);
      if (javaFiles.length > 0) return "java";

      const goFiles = await this.findFilesByExtension(projectPath, [".go"]);
      if (goFiles.length > 0) return "go";

      return undefined;
    } catch {
      return undefined;
    }
  }

  private async detectFramework(
    projectPath: string
  ): Promise<string | undefined> {
    try {
      const packageJsonPath = path.join(projectPath, "package.json");
      if (await this.fileExists(packageJsonPath)) {
        const packageJson = JSON.parse(
          await fs.promises.readFile(packageJsonPath, "utf8")
        );

        if (packageJson.dependencies?.["react"]) return "react";
        if (packageJson.dependencies?.["vue"]) return "vue";
        if (packageJson.dependencies?.["angular"]) return "angular";
        if (packageJson.dependencies?.["next"]) return "next";
        if (packageJson.dependencies?.["nuxt"]) return "nuxt";
        if (packageJson.dependencies?.["express"]) return "express";
        if (packageJson.dependencies?.["fastify"]) return "fastify";
        if (packageJson.dependencies?.["nest"]) return "nestjs";
      }

      return undefined;
    } catch {
      return undefined;
    }
  }

  private async findFilesByExtension(
    dirPath: string,
    extensions: string[]
  ): Promise<string[]> {
    const files: string[] = [];
    try {
      const entries = await fs.promises.readdir(dirPath, {
        withFileTypes: true,
      });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          if (["node_modules", ".git", "dist", "build"].includes(entry.name))
            continue;
          const subFiles = await this.findFilesByExtension(
            path.join(dirPath, entry.name),
            extensions
          );
          files.push(...subFiles);
        } else {
          const ext = path.extname(entry.name);
          if (extensions.includes(ext)) {
            files.push(path.join(dirPath, entry.name));
          }
        }
      }
    } catch (error) {
      this.logger.error(`Error finding files in ${dirPath}:`, error);
    }

    return files;
  }

  async getAllProjects(): Promise<ProjectDto[]> {
    return Array.from(this.projects.values());
  }

  async getProject(projectPath: string): Promise<ProjectDto | null> {
    return this.projects.get(projectPath) || null;
  }

  async refreshProject(projectPath: string): Promise<ProjectDto | null> {
    const projectName = path.basename(projectPath);
    const project = await this.analyzeProject(projectPath, projectName);
    if (project) {
      this.projects.set(projectPath, project);
    }
    return project;
  }

  async refreshAllProjects(): Promise<ProjectDto[]> {
    this.projects.clear();
    return await this.scanWorkspace();
  }
}
