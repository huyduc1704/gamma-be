import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'Admin@123' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'NewPass@456' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
