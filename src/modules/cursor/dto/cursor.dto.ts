import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsNumber,
} from "class-validator";

export class CursorPromptDto {
  @IsString()
  projectPath: string;

  @IsString()
  prompt: string;

  @IsOptional()
  @IsString()
  context?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  files?: string[];

  @IsOptional()
  @IsBoolean()
  openInCursor?: boolean;
}

export class CursorCommandDto {
  @IsString()
  projectPath: string;

  @IsString()
  command: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  args?: string[];

  @IsOptional()
  @IsString()
  workingDirectory?: string;
}

export class CursorOpenDto {
  @IsString()
  projectPath: string;

  @IsOptional()
  @IsString()
  file?: string;

  @IsOptional()
  @IsNumber()
  line?: number;

  @IsOptional()
  @IsNumber()
  column?: number;
}

export class CursorResponse {
  @IsString()
  id: string;

  @IsString()
  status: "pending" | "running" | "completed" | "error";

  @IsOptional()
  @IsString()
  result?: string;

  @IsOptional()
  @IsString()
  error?: string;

  @IsString()
  timestamp: string;

  @IsOptional()
  @IsNumber()
  duration?: number;
}

export class CursorStatusDto {
  @IsString()
  projectPath: string;
}
