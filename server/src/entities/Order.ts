import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

export type OrderStatus = 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerId: string;

  @Column({ nullable: true })
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
    enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  })
  status: OrderStatus;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'int', nullable: true })
  rating: number;

  @Column({ nullable: true })
  ratingComment: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'driverId' })
  driver: User;
} 