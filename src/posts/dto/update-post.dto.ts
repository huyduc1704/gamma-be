import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdatePostDto {
  @ApiPropertyOptional({ example: 'Nhà Phố Hiện Đại 8x28m - Anh Nghĩa' })
  @IsOptional() @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'nha-pho-hien-dai-8x28m-anh-nghia' })
  @IsOptional() @IsString()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  excerpt?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  content?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({
    description: 'JSON string metadata',
    example: '{"client":"Anh Nghĩa","location":"Bình Phước"}',
  })
  @IsOptional() @IsString()
  metadata?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? +value : undefined))
  @IsInt() @Min(0)
  order?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsBoolean()
  isActive?: boolean;
}
