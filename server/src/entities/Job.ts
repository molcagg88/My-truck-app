import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { Order } from './Order';
import { Payment } from './Payment';
import { JobStatus } from '../types/enums';
import { Bid } from './Bid';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @ManyToOne(() => Order, order => order.jobs)
  @JoinColumn()
  order: Order;

  @Column()
  driverId: string;

  @ManyToOne(() => User, user => user.jobs)
  @JoinColumn()
  driver: User;

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

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  pickupLocation: string;

  @Column({ nullable: true })
  destinationLocation: string;

  @Column({ nullable: true })
  currentLocation: string;

  @Column({ nullable: true })
  estimatedArrivalTime: Date;

  @Column({ nullable: true })
  actualArrivalTime: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @OneToOne(() => Payment, payment => payment.job)
  @JoinColumn()
  payment: Payment;

  @OneToMany(() => Bid, bid => bid.job)
  bids: Bid[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 