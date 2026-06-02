import {
  Controller, Get, Post, Put, Delete,
  Body, Param, ParseIntPipe, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { ConsultationLeadsService } from './consultation-leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { QueryLeadDto } from './dto/query-lead.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Consultation Leads')
@Controller('consultation-leads')
export class ConsultationLeadsController {
  constructor(private readonly service: ConsultationLeadsService) {}

  // ─── PUBLIC: form liên hệ từ landing page ─────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Khách gửi form tư vấn (public)' })
  submit(@Body() dto: CreateLeadDto) {
    return this.service.submit(dto);
  }

  // ─── ADMIN ────────────────────────────────────────────────────────────────

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Thống kê leads: tổng, hôm nay, theo trạng thái' })
  getStats() {
    return this.service.getStats();
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Danh sách leads — filter status, search, pagination' })
  findAll(@Query() query: QueryLeadDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Chi tiết 1 lead' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Cập nhật trạng thái + ghi chú nội bộ + phân công nhân viên' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLeadStatusDto,
  ) {
    return this.service.updateStatus(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Xoá lead' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
