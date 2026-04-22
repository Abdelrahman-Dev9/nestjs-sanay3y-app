import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() data: { email: string; name: string; password: string }) {
    return this.authService.signup(data);
  }
  @Post('login')
  login(@Body() data: { email: string; password: string }) {
    return this.authService.login(data);
  }
}
