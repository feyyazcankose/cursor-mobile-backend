import { IsString, IsOptional, IsNumber, IsBoolean } from "class-validator";

export class FileDto {
  @IsString()
  name: string;

  @IsString()
  path: string;

  @IsString()
  relativePath: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumber()
  size?: number;

  @IsOptional()
  @IsString()
  lastModified?: string;

  @IsOptional()
  @IsBoolean()
  isDirectory?: boolean;

  @IsOptional()
  @IsString()
  language?: string;
}

export class FileListDto {
  @IsString()
  projectPath: string;

  @IsOptional()
  @IsString()
  directoryPath?: string;
}

export class FileContentDto {
  @IsString()
  projectPath: string;

  @IsString()
  filePath: string;
}

export class FileWriteDto {
  @IsString()
  projectPath: string;

  @IsString()
  filePath: string;

  @IsString()
  content: string;
}
