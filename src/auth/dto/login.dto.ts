import { IsEmail, IsStrongPassword, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;
  @IsStrongPassword()
  @MinLength(8)
  password: string;
}
