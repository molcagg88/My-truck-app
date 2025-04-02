import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Job } from './Job';
import { DriverStatus } from '../types/enums';

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: DriverStatus.OFFLINE
  })
  status: string;

  @Column('simple-json', { nullable: true })
  currentLocation: {
    latitude: number;
    longitude: number;
    timestamp: Date;
  } | null;

  @OneToMany(() => Job, job => job.driver)
  jobs: Job[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}