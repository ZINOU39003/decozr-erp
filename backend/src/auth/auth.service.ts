import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { computeEffectivePermissions } from '../rbac/effective-permissions';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && user.password_hash) {
      const isMatch = await bcrypt.compare(pass, user.password_hash);
      if (isMatch) {
        const { password_hash, ...result } = user;
        return result;
      }
    }
    return null;
  }

  private buildPayload(user: any) {
    const roles = user.userRoles?.map((ur: any) => ur.role?.slug ?? ur.role) || [];
    return {
      email: user.email,
      sub: user.id,
      roles,
      customer_id: user.customer_id || null,
    };
  }

  private async serializeUser(user: any, roles: string[]) {
    const permissions = user.id
      ? await computeEffectivePermissions(this.prisma, user.id)
      : [];
    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name_ar,
      roles,
      role: roles[0] || 'user',
      permissions,
      customer_id: user.customer_id || null,
      avatar_url: user.avatar_url,
      is_portal: roles.includes('customer') || roles.includes('distributor') || !!user.customer_id,
    };
  }

  async login(user: any) {
    const payload = this.buildPayload(user);
    const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refresh_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET ?? 'decozr-refresh-secret-2026',
      expiresIn: '30d',
    });
    const hashedRefreshToken = await bcrypt.hash(refresh_token, 10);

    await this.prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token_hash: hashedRefreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    return {
      access_token,
      refresh_token,
      user: await this.serializeUser(user, payload.roles),
    };
  }

  async refresh(refreshToken: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET ?? 'decozr-refresh-secret-2026',
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findById(payload.sub);
    const newPayload = this.buildPayload(user);
    const access_token = this.jwtService.sign(newPayload, { expiresIn: '15m' });

    return { access_token, user: await this.serializeUser(user, newPayload.roles) };
  }

  async logout(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET ?? 'decozr-refresh-secret-2026',
      });
      await this.prisma.refreshToken.updateMany({
        where: { user_id: payload.sub, revoked_at: null },
        data: { revoked_at: new Date() },
      });
    } catch {
      // ignore invalid token on logout
    }
    return { message: 'Logged out successfully' };
  }

  async me(userId: string) {
    const user = await this.usersService.findById(userId);
    const roles = user.userRoles?.map((ur: any) => ur.role?.slug) || [];
    return this.serializeUser(user, roles);
  }
}
