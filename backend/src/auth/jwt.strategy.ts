import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { computeEffectivePermissions } from '../rbac/effective-permissions';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'decozr-erp-v3-super-secret-key-jwt-2026',
    });
  }

  async validate(payload: any) {
    const roles = payload.roles || [];
    let permissions: string[] = [];
    try {
      if (payload.sub) {
        permissions = await computeEffectivePermissions(this.prisma, payload.sub);
      }
    } catch {
      permissions = [];
    }
    return {
      id: payload.sub,
      email: payload.email,
      roles,
      permissions,
      customer_id: payload.customer_id || null,
    };
  }
}
