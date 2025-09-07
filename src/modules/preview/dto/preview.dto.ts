import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
} from "class-validator";

export class DevServerDto {
  @IsString()
  projectPath: string;

  @IsString()
  name: string;

  @IsString()
  url: string;

  @IsNumber()
  port: number;

  @IsString()
  status: "running" | "stopped" | "starting" | "error";

  @IsOptional()
  @IsString()
  command?: string;

  @IsOptional()
  @IsString()
  workingDirectory?: string;

  @IsOptional()
  @IsString()
  pid?: string;

  @IsOptional()
  @IsString()
  lastStarted?: string;

  @IsOptional()
  @IsString()
  framework?: string;
}

export class StartDevServerDto {
  @IsString()
  projectPath: string;

  @IsOptional()
  @IsString()
  command?: string;

  @IsOptional()
  @IsNumber()
  port?: number;

  @IsOptional()
  @IsString()
  framework?: string;
}

export class StopDevServerDto {
  @IsString()
  projectPath: string;

  @IsOptional()
  @IsString()
  serverId?: string;
}

export class PortCheckDto {
  @IsNumber()
  port: number;

  @IsOptional()
  @IsString()
  host?: string;
}
