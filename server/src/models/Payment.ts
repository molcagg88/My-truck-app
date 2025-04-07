import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  outTradeNo: string;

  @Column()
  referenceId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  subject: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'completed', 'failed', 'expired'],
    default: 'pending'
  })
  status: 'pending' | 'completed' | 'failed' | 'expired';

  @Column({ default: 'telebirr' })
  paymentMethod: string;

  @Column({ nullable: true })
  customerName: string;

  @Column({ nullable: true })
  customerPhone: string;

  @Column({ nullable: true })
  tradeNo: string;

  @Column({ nullable: true })
  toPayUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column('json', { nullable: true })
  metadata: Record<string, any>;

  // Methods for checking payment status
  isExpired(): boolean {
    return this.expiresAt && this.expiresAt < new Date();
  }

  isPending(): boolean {
    return this.status === 'pending' && !this.isExpired();
  }

  isCompleted(): boolean {
    return this.status === 'completed';
  }

  isFailed(): boolean {
    return this.status === 'failed' || this.isExpired();
  }
} 