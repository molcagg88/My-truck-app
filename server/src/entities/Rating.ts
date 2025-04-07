import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Driver } from './Driver';
import { Job } from './Job';

@Entity('ratings')
export class Rating {
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

  @Column({ type: 'uuid', nullable: true })
  customerId: string;

  @Column({ type: 'int' })
  value: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'jsonb', nullable: true })
  categories: {
    punctuality?: number;
    service?: number;
    communication?: number;
    safety?: number;
    cleanliness?: number;
  };

  @CreateDateColumn()
  createdAt: Date;
} 