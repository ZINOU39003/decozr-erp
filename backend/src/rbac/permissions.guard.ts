import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) throw new ForbiddenException('غير مصرح');

    const roles: string[] = Array.isArray(user.roles) ? user.roles : [];
    if (roles.includes('admin')) return true;

    const perms: string[] = Array.isArray(user.permissions) ? user.permissions : [];
    const ok = required.some((p) => perms.includes(p));
    if (!ok) {
      throw new ForbiddenException('ليس لديك صلاحية لهذا الإجراء');
    }
    return true;
  }
}
