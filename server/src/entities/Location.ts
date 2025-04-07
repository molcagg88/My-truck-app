import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', default: 'user' })
  userType: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;
  
  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;
  
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  accuracy: number;
  
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  heading: number;
  
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  speed: number;
  
  @Column({ type: 'timestamp', nullable: true })
  locationTimestamp: Date;
  
  @CreateDateColumn()
  createdAt: Date;
} 