import { PickType } from "@nestjs/swagger";
import { CreateAuthDto } from "./create-auth.dto";

export class LogInDto extends PickType(CreateAuthDto, ["loginId", "password"]) {}
