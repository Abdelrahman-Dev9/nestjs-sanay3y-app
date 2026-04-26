import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { sendResetCode } from './mail/mail.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    });
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

    const { password, ...safeUser } = user;
    return safeUser;
  }
  async forgotPassword(data: ForgotPasswordDto) {
    const email = data.email.toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // 🔒 Security (don’t reveal if email exists)
    if (!user) {
      return { message: 'If this email exists, a code was sent' };
    }

    // 🔢 generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // ⏱ expire after 10 minutes
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    // 💾 save to DB
    await this.prisma.user.update({
      where: { email },
      data: {
        resetCode: code,
        resetCodeExpiry: expiry,
      },
    });

    // 📧 send email
    await sendResetCode(email, code);

    return { message: 'If this email exists, a code was sent' };
  }
}
