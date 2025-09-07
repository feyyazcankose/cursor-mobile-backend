import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { simpleGit, SimpleGit, StatusResult } from "simple-git";
import * as fs from "fs";
import * as path from "path";
import {
  GitStatusDto,
  GitDiffDto,
  GitCommitDto,
  GitLogDto,
  GitBranchDto,
  GitCheckoutDto,
  GitPullDto,
  GitPushDto,
  GitFileStatus,
  GitCommitInfo,
  GitDiffInfo,
} from "./dto/git.dto";

@Injectable()
export class GitService {
  private readonly logger = new Logger(GitService.name);
  private gitInstances: Map<string, SimpleGit> = new Map();

  constructor(private configService: ConfigService) {}

  private getGitInstance(projectPath: string): SimpleGit {
    if (!this.gitInstances.has(projectPath)) {
      const git = simpleGit(projectPath);
      this.gitInstances.set(projectPath, git);
    }
    return this.gitInstances.get(projectPath)!;
  }

  private async isGitRepository(projectPath: string): Promise<boolean> {
    const gitPath = path.join(projectPath, ".git");
    return await fs.promises
      .access(gitPath)
      .then(() => true)
      .catch(() => false);
  }

  async getStatus(projectPath: string): Promise<GitFileStatus[]> {
    if (!(await this.isGitRepository(projectPath))) {
      throw new BadRequestException("Not a git repository");
    }

    try {
      const git = this.getGitInstance(projectPath);
      const status: StatusResult = await git.status();

      const fileStatuses: GitFileStatus[] = [];

      // Modified files
      status.modified.forEach((file) => {
        fileStatuses.push({
          file,
          status: "modified",
          staged: status.staged.includes(file) ? "staged" : "unstaged",
        });
      });

      // Added files
      status.not_added.forEach((file) => {
        fileStatuses.push({
          file,
          status: "untracked",
          staged: "unstaged",
        });
      });

      // Staged files
      status.staged.forEach((file) => {
        if (!status.modified.includes(file)) {
          fileStatuses.push({
            file,
            status: "added",
            staged: "staged",
          });
        }
      });

      // Deleted files
      status.deleted.forEach((file) => {
        fileStatuses.push({
          file,
          status: "deleted",
          staged: status.staged.includes(file) ? "staged" : "unstaged",
        });
      });

      // Renamed files
      status.renamed.forEach((rename) => {
        fileStatuses.push({
          file: `${rename.from} -> ${rename.to}`,
          status: "renamed",
          staged: "staged",
        });
      });

      return fileStatuses;
    } catch (error) {
      this.logger.error(`Error getting git status for ${projectPath}:`, error);
      throw new BadRequestException(
        `Failed to get git status: ${error.message}`
      );
    }
  }

  async getDiff(
    projectPath: string,
    file?: string,
    commit?: string
  ): Promise<GitDiffInfo[]> {
    if (!(await this.isGitRepository(projectPath))) {
      throw new BadRequestException("Not a git repository");
    }

    try {
      const git = this.getGitInstance(projectPath);
      let diff: string;

      if (commit) {
        // Show diff for specific commit
        diff = await git.show([commit, "--name-only", "--pretty=format:"]);
      } else if (file) {
        // Show diff for specific file
        diff = await git.diff([file]);
      } else {
        // Show working directory diff
        diff = await git.diff();
      }

      // Parse diff output
      const diffInfos: GitDiffInfo[] = [];
      const lines = diff.split("\n");
      let currentFile = "";
      let currentDiff = "";

      for (const line of lines) {
        if (line.startsWith("diff --git")) {
          if (currentFile && currentDiff) {
            diffInfos.push({
              file: currentFile,
              diff: currentDiff.trim(),
            });
          }
          currentFile = line.split(" ")[2]?.replace("a/", "") || "";
          currentDiff = line + "\n";
        } else if (currentFile) {
          currentDiff += line + "\n";
        }
      }

      if (currentFile && currentDiff) {
        diffInfos.push({
          file: currentFile,
          diff: currentDiff.trim(),
        });
      }

      return diffInfos;
    } catch (error) {
      this.logger.error(`Error getting git diff for ${projectPath}:`, error);
      throw new BadRequestException(`Failed to get git diff: ${error.message}`);
    }
  }

  async commit(
    projectPath: string,
    message: string,
    files?: string[],
    all: boolean = false
  ): Promise<GitCommitInfo> {
    if (!(await this.isGitRepository(projectPath))) {
      throw new BadRequestException("Not a git repository");
    }

    try {
      const git = this.getGitInstance(projectPath);

      // Add files to staging
      if (all) {
        await git.add(".");
      } else if (files && files.length > 0) {
        await git.add(files);
      }

      // Commit
      const commitResult = await git.commit(message);

      // Get commit info
      const log = await git.log({ maxCount: 1 });
      const latestCommit = log.latest;

      return {
        hash: latestCommit?.hash || commitResult.commit,
        message: latestCommit?.message || message,
        author: latestCommit?.author_name || "Unknown",
        date: latestCommit?.date || new Date().toISOString(),
        email: latestCommit?.author_email,
      };
    } catch (error) {
      this.logger.error(`Error committing to ${projectPath}:`, error);
      throw new BadRequestException(`Failed to commit: ${error.message}`);
    }
  }

  async getLog(
    projectPath: string,
    since?: string,
    until?: string,
    author?: string,
    file?: string,
    limit: number = 50
  ): Promise<GitCommitInfo[]> {
    if (!(await this.isGitRepository(projectPath))) {
      throw new BadRequestException("Not a git repository");
    }

    try {
      const git = this.getGitInstance(projectPath);
      const options: any = { maxCount: limit };

      if (since) options.since = since;
      if (until) options.until = until;
      if (author) options.author = author;
      if (file) options.file = file;

      const log = await git.log(options);

      return log.all.map((commit) => ({
        hash: commit.hash,
        message: commit.message,
        author: commit.author_name,
        date: commit.date,
        email: commit.author_email,
      }));
    } catch (error) {
      this.logger.error(`Error getting git log for ${projectPath}:`, error);
      throw new BadRequestException(`Failed to get git log: ${error.message}`);
    }
  }

  async getBranches(projectPath: string): Promise<string[]> {
    if (!(await this.isGitRepository(projectPath))) {
      throw new BadRequestException("Not a git repository");
    }

    try {
      const git = this.getGitInstance(projectPath);
      const branches = await git.branch();
      return branches.all;
    } catch (error) {
      this.logger.error(`Error getting branches for ${projectPath}:`, error);
      throw new BadRequestException(`Failed to get branches: ${error.message}`);
    }
  }

  async getCurrentBranch(projectPath: string): Promise<string> {
    if (!(await this.isGitRepository(projectPath))) {
      throw new BadRequestException("Not a git repository");
    }

    try {
      const git = this.getGitInstance(projectPath);
      const status = await git.status();
      return status.current;
    } catch (error) {
      this.logger.error(
        `Error getting current branch for ${projectPath}:`,
        error
      );
      throw new BadRequestException(
        `Failed to get current branch: ${error.message}`
      );
    }
  }

  async checkout(projectPath: string, branch: string): Promise<void> {
    if (!(await this.isGitRepository(projectPath))) {
      throw new BadRequestException("Not a git repository");
    }

    try {
      const git = this.getGitInstance(projectPath);
      await git.checkout(branch);
    } catch (error) {
      this.logger.error(
        `Error checking out branch ${branch} in ${projectPath}:`,
        error
      );
      throw new BadRequestException(
        `Failed to checkout branch: ${error.message}`
      );
    }
  }

  async createBranch(projectPath: string, branch: string): Promise<void> {
    if (!(await this.isGitRepository(projectPath))) {
      throw new BadRequestException("Not a git repository");
    }

    try {
      const git = this.getGitInstance(projectPath);
      await git.checkoutLocalBranch(branch);
    } catch (error) {
      this.logger.error(
        `Error creating branch ${branch} in ${projectPath}:`,
        error
      );
      throw new BadRequestException(
        `Failed to create branch: ${error.message}`
      );
    }
  }

  async pull(
    projectPath: string,
    remote: string = "origin",
    branch?: string
  ): Promise<void> {
    if (!(await this.isGitRepository(projectPath))) {
      throw new BadRequestException("Not a git repository");
    }

    try {
      const git = this.getGitInstance(projectPath);
      if (branch) {
        await git.pull(remote, branch);
      } else {
        await git.pull();
      }
    } catch (error) {
      this.logger.error(
        `Error pulling from ${remote} in ${projectPath}:`,
        error
      );
      throw new BadRequestException(`Failed to pull: ${error.message}`);
    }
  }

  async push(
    projectPath: string,
    remote: string = "origin",
    branch?: string
  ): Promise<void> {
    if (!(await this.isGitRepository(projectPath))) {
      throw new BadRequestException("Not a git repository");
    }

    try {
      const git = this.getGitInstance(projectPath);
      if (branch) {
        await git.push(remote, branch);
      } else {
        await git.push();
      }
    } catch (error) {
      this.logger.error(`Error pushing to ${remote} in ${projectPath}:`, error);
      throw new BadRequestException(`Failed to push: ${error.message}`);
    }
  }

  async initRepository(projectPath: string): Promise<void> {
    try {
      const git = this.getGitInstance(projectPath);
      await git.init();

      // Set default author
      const authorName =
        this.configService.get<string>("GIT_AUTHOR_NAME") || "Mobile Backend";
      const authorEmail =
        this.configService.get<string>("GIT_AUTHOR_EMAIL") ||
        "mobile-backend@cursor.local";

      await git.addConfig("user.name", authorName);
      await git.addConfig("user.email", authorEmail);
    } catch (error) {
      this.logger.error(
        `Error initializing git repository in ${projectPath}:`,
        error
      );
      throw new BadRequestException(
        `Failed to initialize git repository: ${error.message}`
      );
    }
  }
}
