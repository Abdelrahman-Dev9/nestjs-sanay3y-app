import { Body, Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('')
  user(@Body() data: { email: string; name: string }) {
    return this.authService.user(data);
  }
}
