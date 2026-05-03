import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { sendResetCode } from './mail/mail.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(data: SignupDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });
    if (user) {
      return { message: 'user already exist' };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    });

    return {
      message: 'user created successfully',
    };
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });
    if (!user) {
      return { message: 'user not found' };
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      String(user.password),
    );

    if (!isPasswordValid) {
      return { message: 'Invalid username or password' };
    }

    return {
      message: 'Login successful',
    };
  }

  async forgotPassword(data: ForgotPasswordDto) {
    const email = data.email.toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { message: 'If this email exists, a code was sent' };
    }

    // 🔢 generate code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // ⏱ expiry
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    // 🔐 hash code before saving
    const hashedCode = await bcrypt.hash(code, 10);

    // 🎟 token (NO code inside)
    const token = this.jwtService.sign(
      { userId: user.id },
      { expiresIn: '10m' },
    );

    await this.prisma.user.update({
      where: { email },
      data: {
        resetCode: hashedCode,
        resetCodeExpiry: expiry,
      },
    });

    await sendResetCode(email, code);

    return {
      message: 'If this email exists, a code was sent',
      token,
    };
  }
  async createNewPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify<{ userId: string }>(token);
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await this.prisma.user.update({
        where: { id: payload.userId },
        data: {
          password: hashedPassword,
          resetCode: null,
          resetCodeExpiry: null,
        },
      });

      return { message: 'Password updated successfully' };
    } catch {
      throw new BadRequestException('Invalid or expired token');
    }
  }
}
