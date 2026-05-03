import { Body, Controller, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() data: SignupDto) {
    return this.authService.signup(data);
  }
  @Post('login')
  login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

  @Post('forgot-password')
  forgotPassword(@Body() data: ForgotPasswordDto) {
    return this.authService.forgotPassword(data);
  }

  @Post('create-new-password')
  createNewPassword(
    @Headers('token') authHeader: string,
    @Body() body: { newPassword: string },
  ) {
    const token = authHeader?.split(' ')[1]; // Bearer TOKEN

    return this.authService.createNewPassword(token, body.newPassword);
  }
}
