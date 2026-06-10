import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthUser } from '../types/auth-user';
import { Role } from '../../users/domain/value-objects/role';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    // TODO(Pascal): Implementierung — ca. 8 Zeilen:
    //   1) Benötigte Rollen lesen:
    //      const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [ctx.getHandler(), ctx.getClass()]);
    //   2) Wenn `required` undefined/leer ist → Endpoint hat keine Rollen-Anforderung → true zurückgeben.
    //   3) Sonst den eingeloggten User holen (der JwtAuthGuard hat ihn schon angehängt):
    //      const { user } = ctx.switchToHttp().getRequest<{ user?: AuthUser }>();
    //   4) true nur, wenn user existiert UND user.role in `required` enthalten ist.
    //      (false → NestJS antwortet automatisch mit 403 Forbidden)
    return true;
  }
}
