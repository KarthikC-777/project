import { ApiProperty } from "@nestjs/swagger";

export class leaveDto {
  readonly email: string;

  @ApiProperty({
    description:"Date for the leave",
    example:"2023-10-27"
  })
  readonly leaveDate: string;
  readonly status: boolean;
  readonly approveLink: string;
  readonly rejectLink: string;
  readonly rejected: boolean;
}
