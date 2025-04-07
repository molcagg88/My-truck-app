import { Request, Response } from 'express';
import { OrderService } from '../services/orderService';
import { AppError } from '../middleware/error';

export class OrderController {
  // Create new order
  static createOrder = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { pickupLocation, destinationLocation, truckType, description, price } = req.body;

      const order = await OrderService.createOrder({
        customerId: userId,
        pickupLocation,
        destinationLocation,
        truckType,
        description,
        price
      });

      res.status(201).json(order);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ message: 'Error creating order' });
    }
  };

  // Get order by ID
  static getOrder = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const order = await OrderService.getOrderById(id);
      res.json(order);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error fetching order' });
      }
    }
  };

  // Get customer's orders
  static getCustomerOrders = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const orders = await OrderService.getCustomerOrders(userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching orders' });
    }
  };

  // Get driver's orders
  static getDriverOrders = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const orders = await OrderService.getDriverOrders(userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching orders' });
    }
  };

  // Get available orders for drivers
  static getAvailableOrders = async (req: Request, res: Response) => {
    try {
      const orders = await OrderService.getAvailableOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching available orders' });
    }
  };

  // Place a bid on an order
  static placeBid = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { orderId, proposedPrice, comment } = req.body;

      const bid = await OrderService.placeBid({
        orderId,
        driverId: userId,
        proposedPrice,
        comment
      });

      res.status(201).json(bid);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error placing bid' });
      }
    }
  };

  // Accept a bid
  static acceptBid = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { bidId } = req.params;

      const order = await OrderService.acceptBid(bidId, userId);
      res.json(order);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error accepting bid' });
      }
    }
  };

  // Complete payment for an order
  static completePayment = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;

      const order = await OrderService.completePayment(orderId, userId);
      res.json(order);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error completing payment' });
      }
    }
  };

  // Update order status
  static updateStatus = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;
      const { status } = req.body;

      const order = await OrderService.updateOrderStatus(orderId, status, userId);
      res.json(order);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error updating order status' });
      }
    }
  };

  // Cancel order
  static cancelOrder = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;

      const order = await OrderService.cancelOrder(orderId, userId);
      res.json(order);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error cancelling order' });
      }
    }
  };
} 