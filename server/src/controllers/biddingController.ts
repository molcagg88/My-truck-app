import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import biddingService from "../services/biddingService";
import { logger } from "../utils/logger";

class BiddingController {
  /**
   * Create a new bid
   */
  async createBid(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobId, proposedPrice, comment } = req.body;
      
      // Check if user exists (should be set by auth middleware)
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }
      
      const driverId = req.user.id;

      if (!jobId || !proposedPrice) {
        throw new AppError("Job ID and proposed price are required", 400);
      }

      // Validate proposed price
      if (isNaN(proposedPrice) || proposedPrice <= 0) {
        throw new AppError("Proposed price must be a positive number", 400);
      }

      const bid = await biddingService.createBid({
        jobId,
        driverId,
        proposedPrice,
        comment
      });

      res.status(201).json({
        status: "success",
        data: bid
      });
    } catch (error) {
      logger.error("Error creating bid:", error);
      next(error);
    }
  }

  /**
   * Get all bids for a job
   */
  async getBidsByJobId(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobId } = req.params;

      if (!jobId) {
        throw new AppError("Job ID is required", 400);
      }

      const bids = await biddingService.getBidsByJobId(jobId);

      res.status(200).json({
        status: "success",
        results: bids.length,
        data: bids
      });
    } catch (error) {
      logger.error("Error getting bids for job:", error);
      next(error);
    }
  }

  /**
   * Get all bids by a driver
   */
  async getBidsByDriverId(req: Request, res: Response, next: NextFunction) {
    try {
      // Check if user exists (should be set by auth middleware)
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }
      
      // The driver ID is taken from the authenticated user
      const driverId = req.user.id;

      const bids = await biddingService.getBidsByDriverId(driverId);

      res.status(200).json({
        status: "success",
        results: bids.length,
        data: bids
      });
    } catch (error) {
      logger.error("Error getting bids by driver:", error);
      next(error);
    }
  }

  /**
   * Accept a bid
   */
  async acceptBid(req: Request, res: Response, next: NextFunction) {
    try {
      const { bidId } = req.params;

      if (!bidId) {
        throw new AppError("Bid ID is required", 400);
      }

      const bid = await biddingService.acceptBid(bidId);

      res.status(200).json({
        status: "success",
        data: bid
      });
    } catch (error) {
      logger.error("Error accepting bid:", error);
      next(error);
    }
  }

  /**
   * Decline a bid
   */
  async declineBid(req: Request, res: Response, next: NextFunction) {
    try {
      const { bidId } = req.params;

      if (!bidId) {
        throw new AppError("Bid ID is required", 400);
      }

      const bid = await biddingService.declineBid(bidId);

      res.status(200).json({
        status: "success",
        data: bid
      });
    } catch (error) {
      logger.error("Error declining bid:", error);
      next(error);
    }
  }

  /**
   * Counter a bid
   */
  async counterBid(req: Request, res: Response, next: NextFunction) {
    try {
      const { bidId } = req.params;
      const { counterPrice } = req.body;

      if (!bidId) {
        throw new AppError("Bid ID is required", 400);
      }

      if (!counterPrice || isNaN(counterPrice) || counterPrice <= 0) {
        throw new AppError("Valid counter price is required", 400);
      }

      const bid = await biddingService.counterBid(bidId, counterPrice);

      res.status(200).json({
        status: "success",
        data: bid
      });
    } catch (error) {
      logger.error("Error countering bid:", error);
      next(error);
    }
  }
}

export default new BiddingController(); 