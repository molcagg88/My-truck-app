import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Driver } from './Driver';
import { Job } from './Job';

@Entity('earnings')
export class Earning {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  driverId: string;

  @ManyToOne(() => Driver)
  @JoinColumn({ name: 'driverId' })
  driver: Driver;

  @Column({ type: 'uuid', nullable: true })
  jobId: string;

  @ManyToOne(() => Job, { nullable: true })
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 50 })
  type: 'job_payment' | 'bonus' | 'adjustment' | 'tip';

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: false })
  isPaid: boolean;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @CreateDateColumn()
  createdAt: Date;
} 