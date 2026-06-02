import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class UpdateHeroSlideDto {
  @ApiPropertyOptional({ example: 'THIẾT KẾ & THI CÔNG' })
  @IsOptional() @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Không gian sống đẳng cấp' })
  @IsOptional() @IsString()
  subtitle?: string;

  @ApiPropertyOptional({ example: 'TRỌN GÓI' })
  @IsOptional() @IsString()
  highlight?: string;

  @ApiPropertyOptional({ example: 'XEM DỰ ÁN' })
  @IsOptional() @IsString()
  ctaText?: string;

  @ApiPropertyOptional({ example: '/du-an' })
  @IsOptional() @IsString()
  ctaLink?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  order?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional() @Transform(({ value }) => value === 'true' || value === true) @IsBoolean()
  isActive?: boolean;
}
