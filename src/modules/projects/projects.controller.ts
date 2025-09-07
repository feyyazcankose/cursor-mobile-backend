import { Controller, Get, Post, Param, Query, Body } from "@nestjs/common";
import { ProjectsService } from "./projects.service";
import { ProjectDto, ProjectListDto } from "./dto/project.dto";

@Controller("projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async getAllProjects(): Promise<ProjectDto[]> {
    return await this.projectsService.getAllProjects();
  }

  @Get("scan")
  async scanWorkspace(): Promise<ProjectDto[]> {
    return await this.projectsService.refreshAllProjects();
  }

  @Get(":path(*)")
  async getProject(
    @Param("path") projectPath: string
  ): Promise<ProjectDto | null> {
    const fullPath = decodeURIComponent(projectPath);
    return await this.projectsService.getProject(fullPath);
  }

  @Post(":path(*)/refresh")
  async refreshProject(
    @Param("path") projectPath: string
  ): Promise<ProjectDto | null> {
    const fullPath = decodeURIComponent(projectPath);
    return await this.projectsService.refreshProject(fullPath);
  }
}
