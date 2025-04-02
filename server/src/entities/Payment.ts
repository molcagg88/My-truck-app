import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Job } from './Job';
import { PaymentStatus } from '../types/enums';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  jobId: string;

  @Column({ type: 'float' })
  amount: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: PaymentStatus.PENDING
  })
  status: string;

  @OneToOne(() => Job, job => job.payment)
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @Column('simple-json', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 