import {
  Controller, Get, Post, Put, Delete,
  Body, Param, ParseIntPipe, Query,
  UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiCookieAuth, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const uploadOptions = { storage: memoryStorage() };

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  // ─── GROUPS ───────────────────────────────────────────────────────────────

  @Get('groups')
  @ApiOperation({ summary: 'Danh sách groups kèm số danh mục — dùng cho sidebar admin' })
  getGroups() {
    return this.service.getGroups();
  }

  // ─── CATEGORIES ───────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Danh sách categories (public) — filter theo group' })
  @ApiQuery({ name: 'group', required: false, description: 'Slug của group: dich-vu, du-an, noi-that...' })
  @ApiQuery({ name: 'groupId', required: false, type: Number })
  @ApiQuery({ name: 'active', required: false, type: Boolean, description: 'Chỉ lấy active=true' })
  getCategories(
    @Query('group') groupSlug?: string,
    @Query('groupId') groupId?: string,
    @Query('active') active?: string,
  ) {
    return this.service.getCategories({
      groupSlug,
      groupId: groupId ? +groupId : undefined,
      onlyActive: active === 'true',
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết 1 danh mục' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Tạo danh mục mới' })
  create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  @Put('reorder')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Kéo thả sắp xếp thứ tự danh mục' })
  reorder(@Body() dto: ReorderCategoriesDto) {
    return this.service.reorder(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Cập nhật danh mục' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/thumbnail')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Upload ảnh thumbnail cho danh mục' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', required: ['file'], properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  uploadThumbnail(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.uploadThumbnail(id, file);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Xoá danh mục' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
