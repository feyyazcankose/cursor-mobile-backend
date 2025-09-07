import { IsString, IsOptional, IsDateString, IsNumber } from "class-validator";

export class ProjectDto {
  @IsString()
  name: string;

  @IsString()
  path: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  lastModified?: string;

  @IsOptional()
  @IsNumber()
  fileCount?: number;

  @IsOptional()
  @IsString()
  gitBranch?: string;

  @IsOptional()
  @IsString()
  gitStatus?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  framework?: string;
}

export class ProjectListDto {
  @IsString()
  path: string;

  @IsOptional()
  @IsString()
  name?: string;
}
