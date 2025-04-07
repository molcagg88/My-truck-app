import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import { User } from "./User";
import { Order } from "./Order";

export enum BidStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  DECLINED = "declined",
  COUNTERED = "countered"
}

@Entity("bids")
export class Bid {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "float" })
  originalPrice: number;

  @Column({ type: "float" })
  proposedPrice: number;

  @Column({
    type: "enum",
    enum: BidStatus,
    default: BidStatus.PENDING
  })
  status: BidStatus;

  @Column({ type: "text", nullable: true })
  comment: string;

  @ManyToOne(() => User, user => user.bids)
  @JoinColumn({ name: "driver_id" })
  driver: User;

  @Column({ name: "driver_id" })
  driverId: string;

  @ManyToOne(() => Order, order => order.bids)
  @JoinColumn({ name: "order_id" })
  order: Order;

  @Column({ name: "order_id" })
  orderId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 