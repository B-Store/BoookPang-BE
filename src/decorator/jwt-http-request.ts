import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RequestTokensByHttp = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    const authorization = request.headers['authorization'];
    const token = authorization ? authorization.replace('Bearer ', '') : null;
    console.log(user)
    const refreshToken = request.body?.refreshToken || request.cookies?.refreshToken || null;
    return { user, token, refreshToken };
  },
);
