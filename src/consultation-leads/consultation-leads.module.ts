import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsultationLead } from './entities/consultation-lead.entity';
import { ConsultationLeadsService } from './consultation-leads.service';
import { ConsultationLeadsController } from './consultation-leads.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ConsultationLead])],
  controllers: [ConsultationLeadsController],
  providers: [ConsultationLeadsService],
})
export class ConsultationLeadsModule {}
