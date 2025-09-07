import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsNumber,
} from "class-validator";

export class GitStatusDto {
  @IsString()
  projectPath: string;
}

export class GitDiffDto {
  @IsString()
  projectPath: string;

  @IsOptional()
  @IsString()
  file?: string;

  @IsOptional()
  @IsString()
  commit?: string;
}

export class GitCommitDto {
  @IsString()
  projectPath: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  files?: string[];

  @IsOptional()
  @IsBoolean()
  all?: boolean;
}

export class GitLogDto {
  @IsString()
  projectPath: string;

  @IsOptional()
  @IsString()
  since?: string;

  @IsOptional()
  @IsString()
  until?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  file?: string;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class GitBranchDto {
  @IsString()
  projectPath: string;

  @IsOptional()
  @IsString()
  branch?: string;
}

export class GitCheckoutDto {
  @IsString()
  projectPath: string;

  @IsString()
  branch: string;
}

export class GitPullDto {
  @IsString()
  projectPath: string;

  @IsOptional()
  @IsString()
  remote?: string;

  @IsOptional()
  @IsString()
  branch?: string;
}

export class GitPushDto {
  @IsString()
  projectPath: string;

  @IsOptional()
  @IsString()
  remote?: string;

  @IsOptional()
  @IsString()
  branch?: string;
}

export class GitFileStatus {
  @IsString()
  file: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  staged?: string;
}

export class GitCommitInfo {
  @IsString()
  hash: string;

  @IsString()
  message: string;

  @IsString()
  author: string;

  @IsString()
  date: string;

  @IsOptional()
  @IsString()
  email?: string;
}

export class GitDiffInfo {
  @IsString()
  file: string;

  @IsString()
  diff: string;

  @IsOptional()
  @IsString()
  status?: string;
}
