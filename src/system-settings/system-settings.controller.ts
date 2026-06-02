import {
  Controller, Get, Put, Post, Delete,
  Body, Param, ParseIntPipe,
  UseGuards, UseInterceptors, UploadedFile,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiCookieAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { SystemSettingsService } from './system-settings.service';
import { UpdateSystemSettingDto } from './dto/update-system-setting.dto';
import { CreateSocialButtonDto } from './dto/create-social-button.dto';
import { UpdateSocialButtonDto } from './dto/update-social-button.dto';
import { ReorderSocialButtonsDto } from './dto/reorder-social-buttons.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const uploadOptions = { storage: memoryStorage() };

@ApiTags('System Settings')
@Controller('system-settings')
export class SystemSettingsController {
  constructor(private readonly service: SystemSettingsService) {}

  // ─── SETTING (public GET, auth PUT) ───────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Lấy cấu hình hệ thống (public)' })
  getSetting() {
    return this.service.getSetting();
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Cập nhật cấu hình hệ thống' })
  updateSetting(@Body() dto: UpdateSystemSettingDto) {
    return this.service.updateSetting(dto);
  }

  @Post('upload/logo')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Upload logo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  uploadLogo(@UploadedFile() file: Express.Multer.File) {
    return this.service.uploadImage('logoUrl', file);
  }

  @Post('upload/favicon')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Upload favicon' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  uploadFavicon(@UploadedFile() file: Express.Multer.File) {
    return this.service.uploadImage('faviconUrl', file);
  }

  @Post('upload/feedback-image')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Upload ảnh section feedback' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  uploadFeedbackImage(@UploadedFile() file: Express.Multer.File) {
    return this.service.uploadImage('feedbackImageUrl', file);
  }

  // ─── SOCIAL BUTTONS ───────────────────────────────────────────────────────

  @Get('social-buttons')
  @ApiOperation({ summary: 'Danh sách social buttons (public)' })
  getAllSocialButtons() {
    return this.service.getAllSocialButtons();
  }

  @Post('social-buttons')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Tạo social button mới' })
  createSocialButton(@Body() dto: CreateSocialButtonDto) {
    return this.service.createSocialButton(dto);
  }

  @Put('social-buttons/reorder')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Sắp xếp lại thứ tự social buttons' })
  reorder(@Body() dto: ReorderSocialButtonsDto) {
    return this.service.reorderSocialButtons(dto);
  }

  @Put('social-buttons/:id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Cập nhật social button' })
  updateSocialButton(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSocialButtonDto,
  ) {
    return this.service.updateSocialButton(id, dto);
  }

  @Post('social-buttons/:id/icon')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Upload icon cho social button' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  uploadIcon(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.uploadSocialButtonIcon(id, file);
  }

  @Delete('social-buttons/:id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Xoá social button' })
  deleteSocialButton(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteSocialButton(id);
  }
}
