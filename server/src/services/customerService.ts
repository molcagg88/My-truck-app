import { AppDataSource } from '../config/database';
import { Order } from '../entities/Order';
import { User } from '../entities/User';
import { Location } from '../entities/Location';
import { TruckType } from '../entities/TruckType';
import { Between, In } from 'typeorm';
import { AppError } from '../middleware/error';
import { OrderStatus } from '../types/enums';

interface OrderQuery {
  customerId: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface CustomerStats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalSpent: number;
}

interface OrderCreateData {
  customerId: string;
  pickupLocation: string;
  destinationLocation: string;
  truckType: string;
  description?: string;
  items?: string[];
  scheduledTime?: Date;
}

export class CustomerService {
  private static orderRepository = AppDataSource.getRepository(Order);
  private static userRepository = AppDataSource.getRepository(User);
  private static locationRepository = AppDataSource.getRepository(Location);
  private static truckTypeRepository = AppDataSource.getRepository(TruckType);

  static async getStats(customerId: string): Promise<CustomerStats> {
    const [totalOrders, activeOrders, completedOrders, totalSpent] = await Promise.all([
      this.orderRepository.count({ where: { customerId } }),
      this.orderRepository.count({ 
        where: { 
          customerId,
          status: In(['pending', 'accepted', 'picked_up', 'in_transit'])
        } 
      }),
      this.orderRepository.count({ 
        where: { 
          customerId,
          status: OrderStatus.DELIVERED
        } 
      }),
      this.orderRepository
        .createQueryBuilder('order')
        .select('SUM(order.price)', 'total')
        .where('order.customerId = :customerId', { customerId })
        .andWhere('order.status = :status', { status: OrderStatus.DELIVERED })
        .getRawOne()
    ]);

    return {
      totalOrders,
      activeOrders,
      completedOrders,
      totalSpent: Number(totalSpent?.total || 0)
    };
  }

  static async getActiveOrders(customerId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: {
        customerId,
        status: In(['pending', 'accepted', 'picked_up', 'in_transit'])
      },
      relations: ['driver', 'truckType'],
      order: { createdAt: 'DESC' }
    });
  }

  static async getOrderHistory(query: OrderQuery): Promise<{ orders: Order[], total: number }> {
    const { customerId, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [orders, total] = await this.orderRepository.findAndCount({
      where: { customerId },
      relations: ['driver', 'truckType'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit
    });

    return { orders, total };
  }

  static async getOrderDetails(orderId: string, customerId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, customerId },
      relations: ['driver', 'truckType']
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    return order;
  }

  static async createOrder(data: OrderCreateData): Promise<Order> {
    const truckType = await this.truckTypeRepository.findOne({
      where: { name: data.truckType }
    });

    if (!truckType) {
      throw new AppError('Invalid truck type', 400);
    }

    // Calculate estimated price based on locations and truck type
    const price = await this.calculatePrice(
      data.pickupLocation, 
      data.destinationLocation, 
      data.truckType
    );

    const order = this.orderRepository.create({
      customer: { id: data.customerId },
      pickupLocation: data.pickupLocation,
      destinationLocation: data.destinationLocation,
      truckType: truckType,
      description: data.description,
      items: data.items,
      scheduledTime: data.scheduledTime,
      status: OrderStatus.PENDING,
      price
    });

    await this.orderRepository.save(order);
    return order;
  }

  static async cancelOrder(orderId: string, customerId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, customer: { id: customerId } }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED) {
      throw new AppError('Cannot cancel this order', 400);
    }

    order.status = OrderStatus.CANCELLED;
    await this.orderRepository.save(order);
    return order;
  }

  static async rateOrder(orderId: string, customerId: string, rating: number, comment?: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, customer: { id: customerId } }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.status !== OrderStatus.DELIVERED) {
      throw new AppError('Can only rate delivered orders', 400);
    }

    order.rating = rating;
    order.ratingComment = comment || '';
    await this.orderRepository.save(order);

    // If driver exists, update their rating
    if (order.driver) {
      await this.updateDriverRating(order.driver.id);
    }

    return order;
  }

  static async searchLocations(query: string): Promise<Location[]> {
    return this.locationRepository
      .createQueryBuilder('location')
      .where('location.name ILIKE :query', { query: `%${query}%` })
      .orWhere('location.address ILIKE :query', { query: `%${query}%` })
      .take(10)
      .getMany();
  }

  static async getSavedLocations(userId: string): Promise<Location[]> {
    return this.locationRepository.find({
      where: { user: { id: userId } }
    });
  }

  static async saveLocation(userId: string, data: Partial<Location>): Promise<Location> {
    const location = this.locationRepository.create({
      ...data,
      user: { id: userId }
    });
    await this.locationRepository.save(location);
    return location;
  }

  static async deleteSavedLocation(locationId: string, userId: string): Promise<void> {
    const location = await this.locationRepository.findOne({
      where: { id: locationId, user: { id: userId } }
    });

    if (!location) {
      throw new AppError('Location not found', 404);
    }

    await this.locationRepository.remove(location);
  }

  static async getTruckTypes(): Promise<TruckType[]> {
    return this.truckTypeRepository.find();
  }

  private static async calculatePrice(
    pickup: string,
    destination: string,
    truckType: string
  ): Promise<number> {
    // In a real app, this would use distance APIs, truck rates, etc.
    // Mock implementation for now
    const basePrice = {
      small: 50,
      medium: 75,
      large: 100,
      xlarge: 150
    }[truckType.toLowerCase()] || 75;

    // Simulate distance calculation
    const distanceFactor = Math.random() * 20 + 10;
    
    return Math.round(basePrice + distanceFactor);
  }

  private static async updateDriverRating(driverId: string): Promise<void> {
    // Calculate average rating from all completed orders
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('AVG(order.rating)', 'avg')
      .where('order.driver.id = :driverId', { driverId })
      .andWhere('order.rating IS NOT NULL')
      .getRawOne();

    if (result && result.avg) {
      const driver = await this.userRepository.findOne({
        where: { id: driverId }
      });

      if (driver) {
        driver.rating = Number(result.avg);
        await this.userRepository.save(driver);
      }
    }
  }
} 