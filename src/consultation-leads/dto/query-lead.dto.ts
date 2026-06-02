import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { LeadStatus } from '../entities/consultation-lead.entity';

export class QueryLeadDto {
  @ApiPropertyOptional({ enum: LeadStatus })
  @IsOptional() @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional({ description: 'Tìm theo tên hoặc số điện thoại' })
  @IsOptional() @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) => (value ? +value : 1))
  @IsInt() @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Transform(({ value }) => (value ? +value : 20))
  @IsInt() @Min(1)
  limit?: number = 20;
}
