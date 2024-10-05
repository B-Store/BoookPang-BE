import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const RequestJwtByHttp = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;
  const authorization = request.headers["authorization"];
  const token = authorization ? authorization.replace("Bearer ", "") : null;
  return { user, token };
});
