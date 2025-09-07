import { Controller, Get, Post, Body, Query, Param } from "@nestjs/common";
import { GitService } from "./git.service";
import {
  GitStatusDto,
  GitDiffDto,
  GitCommitDto,
  GitLogDto,
  GitBranchDto,
  GitCheckoutDto,
  GitPullDto,
  GitPushDto,
} from "./dto/git.dto";

@Controller("git")
export class GitController {
  constructor(private readonly gitService: GitService) {}

  @Get("status")
  async getStatus(@Query() query: GitStatusDto) {
    return await this.gitService.getStatus(query.projectPath);
  }

  @Get("diff")
  async getDiff(@Query() query: GitDiffDto) {
    return await this.gitService.getDiff(
      query.projectPath,
      query.file,
      query.commit
    );
  }

  @Post("commit")
  async commit(@Body() body: GitCommitDto) {
    return await this.gitService.commit(
      body.projectPath,
      body.message,
      body.files,
      body.all
    );
  }

  @Get("log")
  async getLog(@Query() query: GitLogDto) {
    return await this.gitService.getLog(
      query.projectPath,
      query.since,
      query.until,
      query.author,
      query.file,
      query.limit
    );
  }

  @Get("branches")
  async getBranches(@Query() query: GitBranchDto) {
    return await this.gitService.getBranches(query.projectPath);
  }

  @Get("current-branch")
  async getCurrentBranch(@Query() query: GitBranchDto) {
    return {
      branch: await this.gitService.getCurrentBranch(query.projectPath),
    };
  }

  @Post("checkout")
  async checkout(@Body() body: GitCheckoutDto) {
    await this.gitService.checkout(body.projectPath, body.branch);
    return { message: `Switched to branch: ${body.branch}` };
  }

  @Post("create-branch")
  async createBranch(@Body() body: GitCheckoutDto) {
    await this.gitService.createBranch(body.projectPath, body.branch);
    return { message: `Created and switched to branch: ${body.branch}` };
  }

  @Post("pull")
  async pull(@Body() body: GitPullDto) {
    await this.gitService.pull(body.projectPath, body.remote, body.branch);
    return { message: "Pull completed successfully" };
  }

  @Post("push")
  async push(@Body() body: GitPushDto) {
    await this.gitService.push(body.projectPath, body.remote, body.branch);
    return { message: "Push completed successfully" };
  }

  @Post("init")
  async initRepository(@Body() body: { projectPath: string }) {
    await this.gitService.initRepository(body.projectPath);
    return { message: "Git repository initialized successfully" };
  }
}
