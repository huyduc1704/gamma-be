import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { LeadRequirement } from '../entities/consultation-lead.entity';

export class CreateLeadDto {
  @ApiProperty({ example: 'Nguyễn Văn An' })
  @IsString() @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '0901234567' })
  @IsString() @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ example: 'vanan@gmail.com' })
  @IsOptional() @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: LeadRequirement, example: LeadRequirement.BUILD })
  @IsOptional() @IsEnum(LeadRequirement)
  requirement?: LeadRequirement;

  @ApiPropertyOptional({ example: '100-150 m2' })
  @IsOptional() @IsString()
  area?: string;

  @ApiPropertyOptional({ example: 'Hà Nội' })
  @IsOptional() @IsString()
  province?: string;

  @ApiPropertyOptional({ example: 'Muốn xây nhà 2 tầng, mái Thái, ngân sách 1.5 tỷ' })
  @IsOptional() @IsString()
  detailNote?: string;
}
