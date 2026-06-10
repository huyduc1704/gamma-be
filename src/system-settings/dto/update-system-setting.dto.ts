import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsObject } from 'class-validator';

export class UpdateSystemSettingDto {
  @ApiPropertyOptional({ example: 'GAMMA HOME' })
  @IsOptional() @IsString()
  companyName?: string;

  @ApiPropertyOptional({ example: '0123456789' })
  @IsOptional() @IsString()
  taxCode?: string;

  @ApiPropertyOptional({ example: 'Kiến tạo không gian sống' })
  @IsOptional() @IsString()
  slogan?: string;

  @ApiPropertyOptional({ example: '0827.972.555' })
  @IsOptional() @IsString()
  hotline?: string;

  @ApiPropertyOptional({ example: 'info@gammahome.vn' })
  @IsOptional() @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 'G29-30 Ngô Thì Nhậm, Hà Đông, Hà Nội' })
  @IsOptional() @IsString()
  addressNorth?: string;

  @ApiPropertyOptional({ example: 'Đường T2-41 Vinhomes Grand Park, TP.Thủ Đức, HCM' })
  @IsOptional() @IsString()
  addressSouth?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  footerDescription?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  footerCopyright?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  footerFanpageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsObject()
  homeConfig?: any;
}
