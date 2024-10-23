import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RequestTokensByHttp = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    const authorization = request.headers['authorization'];
    const token = authorization ? authorization.replace('Bearer ', '') : null;
    
    const refreshToken = request.body?.refreshToken || request.cookies?.refreshToken || null;
    console.log(user)
    return { user, token, refreshToken };
  },
);
