import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { SocialButtonPosition, SocialButtonType } from '../entities/social-button.entity';

export class UpdateSocialButtonDto {
  @ApiPropertyOptional({ enum: SocialButtonType })
  @IsOptional() @IsEnum(SocialButtonType)
  type?: SocialButtonType;

  @ApiPropertyOptional({ example: '0827972555' })
  @IsOptional() @IsString()
  value?: string;

  @ApiPropertyOptional({ example: 'Zalo Chat' })
  @IsOptional() @IsString()
  label?: string;

  @ApiPropertyOptional({ enum: SocialButtonPosition })
  @IsOptional() @IsEnum(SocialButtonPosition)
  position?: SocialButtonPosition;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional() @IsInt() @Min(0)
  order?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional() @IsBoolean()
  isActive?: boolean;
}
