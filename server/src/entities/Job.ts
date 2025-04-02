import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Driver } from './Driver';
import { Payment } from './Payment';
import { JobStatus } from '../types/enums';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: JobStatus.PENDING
  })
  status: string;

  @Column({ type: 'float' })
  amount: number;

  @Column({ nullable: true })
  driverId: string;

  @ManyToOne(() => Driver, driver => driver.jobs)
  @JoinColumn({ name: 'driverId' })
  driver: Driver;

  @OneToOne(() => Payment, payment => payment.job)
  payment: Payment;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 