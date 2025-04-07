import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Driver } from './Driver';
import { Payment } from './Payment';
import { JobStatus } from '../types/enums';
import { Bid } from './Bid';

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

  @Column({
    type: 'jsonb',
    nullable: true,
    default: {}
  })
  statusTimestamps: Record<string, Date>;

  @Column({ type: 'float' })
  amount: number;

  @Column({ nullable: true })
  driverId: string;

  @Column()
  customerId: string;

  @ManyToOne(() => Driver, driver => driver.jobs, { nullable: true })
  @JoinColumn({ name: 'driverId' })
  driver: Driver | null;

  @OneToOne(() => Payment, payment => payment.job, { nullable: true })
  payment: Payment | null;

  @OneToMany(() => Bid, bid => bid.job)
  bids: Bid[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 