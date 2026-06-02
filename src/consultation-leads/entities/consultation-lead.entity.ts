import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum LeadStatus {
  NEW = 'new',               // Mới — chưa ai xử lý
  CONTACTED = 'contacted',   // Đã gọi điện/nhắn tin
  CONSULTING = 'consulting', // Đang tư vấn
  DONE = 'done',             // Hoàn thành
  CANCELLED = 'cancelled',   // Huỷ / không liên lạc được
}

export enum LeadRequirement {
  BUILD = 'build',           // Xây nhà trọn gói
  DESIGN = 'design',         // Thiết kế kiến trúc
  INTERIOR = 'interior',     // Thiết kế nội thất
  CONSULT = 'consult',       // Tư vấn chung
}

@Entity('consultation_leads')
export class ConsultationLead {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'enum', enum: LeadRequirement, nullable: true })
  requirement: LeadRequirement;

  @Column({ nullable: true })
  area: string;       // Diện tích dự kiến (VD: "100-150 m2")

  @Column({ nullable: true })
  province: string;   // Tỉnh/thành phố

  @Column({ nullable: true, type: 'text' })
  detailNote: string; // Ghi chú của khách

  @Column({ type: 'enum', enum: LeadStatus, default: LeadStatus.NEW })
  status: LeadStatus;

  @Column({ nullable: true, type: 'text' })
  adminNote: string;  // Ghi chú nội bộ của admin

  @Column({ nullable: true })
  assignedTo: string; // Tên nhân viên phụ trách

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
