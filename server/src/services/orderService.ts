import { AppDataSource } from '../config/database';
import { Order } from '../entities/Order';
import { Bid } from '../entities/Bid';
import { AppError } from '../middleware/error';

export class OrderService {
  private static orderRepository = AppDataSource.getRepository(Order);
  private static bidRepository = AppDataSource.getRepository(Bid);

  static async createOrder(data: {
    customerId: string;
    pickupLocation: string;
    destinationLocation: string;
    truckType: string;
    description?: string;
    price: number;
  }): Promise<Order> {
    const order = this.orderRepository.create({
      ...data,
      status: 'pending'
    });

    await this.orderRepository.save(order);
    return order;
  }

  static async getOrderById(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['driver', 'bids', 'bids.driver']
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    return order;
  }

  static async getCustomerOrders(customerId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { customerId },
      relations: ['driver', 'bids', 'bids.driver'],
      order: { createdAt: 'DESC' }
    });
  }

  static async getDriverOrders(driverId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { driverId },
      relations: ['bids', 'bids.driver'],
      order: { createdAt: 'DESC' }
    });
  }

  static async getAvailableOrders(): Promise<Order[]> {
    return this.orderRepository.find({
      where: { status: 'pending' },
      relations: ['bids', 'bids.driver'],
      order: { createdAt: 'DESC' }
    });
  }

  static async placeBid(data: {
    orderId: string;
    driverId: string;
    proposedPrice: number;
    comment?: string;
  }): Promise<Bid> {
    const order = await this.getOrderById(data.orderId);
    
    if (order.status !== 'pending') {
      throw new AppError('Cannot place bid on this order', 400);
    }

    const bid = this.bidRepository.create({
      orderId: data.orderId,
      driverId: data.driverId,
      originalPrice: order.price,
      proposedPrice: data.proposedPrice,
      comment: data.comment,
      status: 'pending'
    });

    await this.bidRepository.save(bid);
    return bid;
  }

  static async acceptBid(bidId: string, customerId: string): Promise<Order> {
    const bid = await this.bidRepository.findOne({
      where: { id: bidId },
      relations: ['order']
    });

    if (!bid) {
      throw new AppError('Bid not found', 404);
    }

    if (bid.order.customerId !== customerId) {
      throw new AppError('Unauthorized', 403);
    }

    if (bid.order.status !== 'pending') {
      throw new AppError('Cannot accept bid on this order', 400);
    }

    // Update bid status
    bid.status = 'accepted';
    await this.bidRepository.save(bid);

    // Update order
    const order = bid.order;
    order.status = 'payment_pending';
    order.driverId = bid.driverId;
    order.price = bid.proposedPrice;
    await this.orderRepository.save(order);

    return order;
  }

  static async completePayment(orderId: string, customerId: string): Promise<Order> {
    const order = await this.getOrderById(orderId);

    if (order.customerId !== customerId) {
      throw new AppError('Unauthorized', 403);
    }

    if (order.status !== 'payment_pending') {
      throw new AppError('Order is not in payment pending state', 400);
    }

    order.status = 'accepted';
    order.isPaid = true;
    await this.orderRepository.save(order);

    return order;
  }

  static async updateOrderStatus(orderId: string, status: Order['status'], userId: string): Promise<Order> {
    const order = await this.getOrderById(orderId);

    // Check if user is authorized to update status
    if (order.customerId !== userId && order.driverId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    order.status = status;
    await this.orderRepository.save(order);

    return order;
  }

  static async cancelOrder(orderId: string, userId: string): Promise<Order> {
    const order = await this.getOrderById(orderId);

    if (order.customerId !== userId && order.driverId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    if (order.status === 'completed' || order.status === 'cancelled') {
      throw new AppError('Cannot cancel this order', 400);
    }

    order.status = 'cancelled';
    await this.orderRepository.save(order);

    return order;
  }
} 