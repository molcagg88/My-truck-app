import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { Bid } from './Bid';

export type OrderStatus = 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled' | 'payment_pending';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  customerId: string;

  @Column({ type: 'uuid', nullable: true })
  driverId: string;

  @Column()
  pickupLocation: string;

  @Column()
  destinationLocation: string;

  @Column()
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'driverId' })
  driver: User;

  @OneToMany(() => Bid, bid => bid.order)
  bids: Bid[];
} 