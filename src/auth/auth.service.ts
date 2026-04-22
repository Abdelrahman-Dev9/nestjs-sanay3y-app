import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(data: { name: string; email: string; password: string }) {
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

  async login(data: { email: string; password: string }) {
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
}
