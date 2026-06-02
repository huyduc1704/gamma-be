import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { AdminRole } from '../entities/admin.entity';

export class CreateAdminDto {
  @ApiProperty({ example: 'staff@gammahome.vn' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Pass@123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ enum: AdminRole, example: AdminRole.ADMIN })
  @IsEnum(AdminRole)
  role: AdminRole;
}
