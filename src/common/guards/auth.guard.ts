import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers["x-api-key"];
    const expectedApiKey = this.configService.get<string>("API_KEY");

    // If no API key is configured, allow all requests (development mode)
    if (!expectedApiKey) {
      return true;
    }

    if (!apiKey || apiKey !== expectedApiKey) {
      throw new UnauthorizedException("Invalid API key");
    }

    return true;
  }
}
