import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { Job } from './Job';
import { Bid } from './Bid';

export type OrderStatus = 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled' | 'payment_pending';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerId: string;

  @ManyToOne(() => User, user => user.orders)
  @JoinColumn()
  customer: User;

  @Column({ type: 'uuid', nullable: true })
  driverId: string;

  @Column()
  pickupLocation: string;

  @Column()
  destinationLocation: string;

  @Column({ nullable: true })
  truckType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled', 'payment_pending'],
    default: 'pending'
  })
  status: OrderStatus;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'int', nullable: true })
  rating: number;

  @Column({ nullable: true })
  ratingComment: string;

  @Column({ default: false })
  isPaid: boolean;

  @Column({ nullable: true })
  weight: number;

  @Column({ nullable: true })
  dimensions: string;

  @OneToMany(() => Job, job => job.order)
  jobs: Job[];

  @OneToMany(() => Bid, bid => bid.order)
  bids: Bid[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'driverId' })
  driver: User;
} 