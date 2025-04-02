import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ActivityType } from '../types/enums';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 50
  })
  type: string;

  @Column('text')
  description: string;

  @Column('simple-json')
  metadata: Record<string, any>;

  @CreateDateColumn()
  timestamp: Date;
} 