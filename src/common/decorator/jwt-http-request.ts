import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const RequestAccessTokenByHttp = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;
  const authorization = request.headers["authorization"];
  const token = authorization ? authorization.replace("Bearer ", "") : null;
  return { user, token };
});

export const RequestRefreshTokenByHttp = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;
  const authorization = request.headers["authorization"];
  const refreshToken = authorization ? authorization.replace("Bearer ", "") : null;
  return { user, refreshToken };
});