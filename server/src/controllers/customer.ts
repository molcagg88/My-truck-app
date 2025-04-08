import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Order } from '../entities/Order';
import { User } from '../entities/User';
import { Location } from '../entities/Location';
import { TruckType } from '../entities/TruckType';
import { Between } from 'typeorm';
import { Job } from '../entities/Job';
import { JobStatus } from '../types/enums';
import { AppError } from '../utils/AppError';
import { NextFunction } from 'express';

export class CustomerController {
  private orderRepository = AppDataSource.getRepository(Order);
  private userRepository = AppDataSource.getRepository(User);
  private locationRepository = AppDataSource.getRepository(Location);
  private truckTypeRepository = AppDataSource.getRepository(TruckType);
  private jobRepository = AppDataSource.getRepository(Job);

  // Get customer dashboard stats
  getStats = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const [totalOrders, activeOrders, completedOrders, totalSpent] = await Promise.all([
        this.orderRepository.count({ where: { customerId: userId } }),
        this.orderRepository.count({ 
          where: { 
            customerId: userId,
            status: Between('pending', 'in-progress')
          } 
        }),
        this.orderRepository.count({ 
          where: { 
            customerId: userId,
            status: 'completed'
          } 
        }),
        this.orderRepository
          .createQueryBuilder('order')
          .select('SUM(order.price)', 'total')
          .where('order.customerId = :userId', { userId })
          .andWhere('order.status = :status', { status: 'completed' })
          .getRawOne()
      ]);

      res.json({
        totalOrders,
        activeOrders,
        completedOrders,
        totalSpent: totalSpent?.total || 0
      });
    } catch (error) {
      console.error('Error getting customer stats:', error);
      res.status(500).json({ message: 'Error getting customer stats' });
    }
  };

  // Get active orders
  getActiveOrders = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const orders = await this.orderRepository.find({
        where: {
          customerId: userId,
          status: Between('pending', 'in-progress')
        },
        relations: ['driver'],
        order: { createdAt: 'DESC' }
      });
      res.json(orders);
    } catch (error) {
      console.error('Error getting active orders:', error);
      res.status(500).json({ message: 'Error getting active orders' });
    }
  };

  // Get order history
  getOrderHistory = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const orders = await this.orderRepository.find({
        where: { customerId: userId },
        relations: ['driver'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit
      });
      res.json(orders);
    } catch (error) {
      console.error('Error getting order history:', error);
      res.status(500).json({ message: 'Error getting order history' });
    }
  };

  // Get order details
  getOrderDetails = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const orderId = req.params.id;
      const order = await this.orderRepository.findOne({
        where: { id: orderId, customerId: userId },
        relations: ['driver']
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.json(order);
    } catch (error) {
      console.error('Error getting order details:', error);
      res.status(500).json({ message: 'Error getting order details' });
    }
  };

  // Create new order
  createOrder = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { pickupLocation, destinationLocation, truckType, description } = req.body;

      const order = this.orderRepository.create({
        customerId: userId,
        pickupLocation,
        destinationLocation,
        truckType,
        description,
        status: 'pending'
      });

      await this.orderRepository.save(order);
      res.status(201).json(order);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ message: 'Error creating order' });
    }
  };

  // Cancel order
  cancelOrder = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const orderId = req.params.id;
      const order = await this.orderRepository.findOne({
        where: { id: orderId, customerId: userId }
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (order.status === 'completed' || order.status === 'cancelled') {
        return res.status(400).json({ message: 'Cannot cancel this order' });
      }

      order.status = 'cancelled';
      await this.orderRepository.save(order);
      res.json(order);
    } catch (error) {
      console.error('Error cancelling order:', error);
      res.status(500).json({ message: 'Error cancelling order' });
    }
  };

  // Rate order
  rateOrder = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const orderId = req.params.id;
      const { rating, comment } = req.body;

      const order = await this.orderRepository.findOne({
        where: { id: orderId, customerId: userId }
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (order.status !== 'completed') {
        return res.status(400).json({ message: 'Can only rate completed orders' });
      }

      order.rating = rating;
      order.ratingComment = comment;
      await this.orderRepository.save(order);
      res.json(order);
    } catch (error) {
      console.error('Error rating order:', error);
      res.status(500).json({ message: 'Error rating order' });
    }
  };

  // Search locations
  searchLocations = async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      const locations = await this.locationRepository
        .createQueryBuilder('location')
        .where('location.name ILIKE :query', { query: `%${query}%` })
        .orWhere('location.address ILIKE :query', { query: `%${query}%` })
        .take(10)
        .getMany();
      res.json(locations);
    } catch (error) {
      console.error('Error searching locations:', error);
      res.status(500).json({ message: 'Error searching locations' });
    }
  };

  // Get saved locations
  getSavedLocations = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const locations = await this.locationRepository.find({
        where: { userId }
      });
      res.json(locations);
    } catch (error) {
      console.error('Error getting saved locations:', error);
      res.status(500).json({ message: 'Error getting saved locations' });
    }
  };

  // Save location
  saveLocation = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const location = this.locationRepository.create({
        ...req.body,
        userId
      });
      await this.locationRepository.save(location);
      res.status(201).json(location);
    } catch (error) {
      console.error('Error saving location:', error);
      res.status(500).json({ message: 'Error saving location' });
    }
  };

  // Delete saved location
  deleteSavedLocation = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const locationId = req.params.id;
      const location = await this.locationRepository.findOne({
        where: { id: locationId, userId }
      });

      if (!location) {
        return res.status(404).json({ message: 'Location not found' });
      }

      await this.locationRepository.remove(location);
      res.json({ message: 'Location deleted successfully' });
    } catch (error) {
      console.error('Error deleting saved location:', error);
      res.status(500).json({ message: 'Error deleting saved location' });
    }
  };

  // Get truck types
  getTruckTypes = async (req: Request, res: Response) => {
    try {
      const truckTypes = await this.truckTypeRepository.find();
      res.json(truckTypes);
    } catch (error) {
      console.error('Error getting truck types:', error);
      res.status(500).json({ message: 'Error getting truck types' });
    }
  };

  // Get pending payments
  getPendingPayments = async (req: Request, res: Response) => {
    try {
      const customerId = req.user?.id;
      if (!customerId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Get all completed orders for this customer that don't have a payment
      const orders = await this.orderRepository
        .createQueryBuilder('order')
        .where('order.customerId = :customerId', { customerId })
        .andWhere('order.status = :status', { status: 'completed' })
        .andWhere('order.isPaid = :isPaid', { isPaid: false })
        .getMany();

      return res.json(orders);
    } catch (error) {
      console.error('Error getting pending payments:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
} 