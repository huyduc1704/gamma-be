import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { LeadStatus } from '../entities/consultation-lead.entity';

export class UpdateLeadStatusDto {
  @ApiProperty({ enum: LeadStatus, example: LeadStatus.CONTACTED })
  @IsEnum(LeadStatus)
  status: LeadStatus;

  @ApiPropertyOptional({ example: 'Đã gọi điện, khách đang cân nhắc' })
  @IsOptional() @IsString()
  adminNote?: string;

  @ApiPropertyOptional({ example: 'Nguyễn Thị B' })
  @IsOptional() @IsString()
  assignedTo?: string;
}
