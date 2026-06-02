import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Xây Nhà Trọn Gói' })
  @IsOptional() @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'xay-nha-tron-goi' })
  @IsOptional() @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'Dịch vụ xây nhà trọn gói từ A-Z' })
  @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional() @IsInt() @Min(0)
  order?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional() @IsBoolean()
  isActive?: boolean;
}
