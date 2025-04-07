import { AppDataSource } from "../config/database";
import { Bid, BidStatus } from "../entities/Bid";
import { Job } from "../entities/Job";
import { Driver } from "../entities/Driver";
import { Payment } from "../entities/Payment";
import { AppError } from "../utils/AppError";
import { JobStatus, PaymentStatus } from "../types/enums";
import { logger } from "../utils/logger";

interface CreateBidParams {
  jobId: string;
  driverId: string;
  proposedPrice: number;
  comment?: string;
}

class BiddingService {
  private bidRepository = AppDataSource.getRepository(Bid);
  private jobRepository = AppDataSource.getRepository(Job);
  private driverRepository = AppDataSource.getRepository(Driver);

  /**
   * Create a new bid for a job
   */
  async createBid(params: CreateBidParams): Promise<Bid> {
    const { jobId, driverId, proposedPrice, comment } = params;

    // Check if job exists
    const job = await this.jobRepository.findOne({ where: { id: jobId } });
    if (!job) {
      throw new AppError("Job not found", 404);
    }

    // Check if job is still open for bidding
    if (job.status !== JobStatus.PENDING) {
      throw new AppError("Job is not available for bidding", 400);
    }

    // Check if driver exists
    const driver = await this.driverRepository.findOne({ where: { id: driverId } });
    if (!driver) {
      throw new AppError("Driver not found", 404);
    }

    // Check if driver already has a bid for this job
    const existingBid = await this.bidRepository.findOne({
      where: { jobId, driverId }
    });

    if (existingBid) {
      // Update existing bid
      existingBid.proposedPrice = proposedPrice;
      existingBid.status = BidStatus.PENDING;
      if (comment) existingBid.comment = comment;
      
      const updatedBid = await this.bidRepository.save(existingBid);
      logger.info(`Bid updated: ${updatedBid.id} for job ${jobId} by driver ${driverId}`);
      return updatedBid;
    }

    // Create new bid
    const bid = new Bid();
    bid.jobId = jobId;
    bid.driverId = driverId;
    bid.originalPrice = job.amount;
    bid.proposedPrice = proposedPrice;
    bid.status = BidStatus.PENDING;
    if (comment) bid.comment = comment;

    const savedBid = await this.bidRepository.save(bid);
    logger.info(`New bid created: ${savedBid.id} for job ${jobId} by driver ${driverId}`);
    
    return savedBid;
  }

  /**
   * Get all bids for a job
   */
  async getBidsByJobId(jobId: string): Promise<Bid[]> {
    // Check if job exists
    const job = await this.jobRepository.findOne({ where: { id: jobId } });
    if (!job) {
      throw new AppError("Job not found", 404);
    }

    const bids = await this.bidRepository.find({
      where: { jobId },
      relations: ["driver"],
      order: { createdAt: "DESC" }
    });

    return bids;
  }

  /**
   * Get all bids by a driver
   */
  async getBidsByDriverId(driverId: string): Promise<Bid[]> {
    // Check if driver exists
    const driver = await this.driverRepository.findOne({ where: { id: driverId } });
    if (!driver) {
      throw new AppError("Driver not found", 404);
    }

    const bids = await this.bidRepository.find({
      where: { driverId },
      relations: ["job"],
      order: { createdAt: "DESC" }
    });

    return bids;
  }

  /**
   * Accept a bid
   */
  async acceptBid(bidId: string): Promise<Bid> {
    // Check if bid exists
    const bid = await this.bidRepository.findOne({
      where: { id: bidId },
      relations: ["job"]
    });

    if (!bid) {
      throw new AppError("Bid not found", 404);
    }

    // Check if job is still available
    if (bid.job.status !== JobStatus.PENDING) {
      throw new AppError("Job is no longer available", 400);
    }

    // Update bid status
    bid.status = BidStatus.ACCEPTED;
    const updatedBid = await this.bidRepository.save(bid);

    // Create a payment record
    const paymentRepository = AppDataSource.getRepository(Payment);
    const payment = new Payment();
    payment.jobId = bid.jobId;
    payment.amount = bid.proposedPrice;
    payment.status = PaymentStatus.PENDING;
    payment.metadata = {
      bidId: bid.id,
      driverId: bid.driverId,
      acceptedAt: new Date(),
      originalPrice: bid.originalPrice
    };
    await paymentRepository.save(payment);

    // Update job status but don't mark it as ACTIVE yet
    // It will only become ACTIVE after customer completes payment
    await this.jobRepository.update(bid.jobId, {
      status: JobStatus.PAYMENT_PENDING, // You'll need to add this status to JobStatus enum
      amount: bid.proposedPrice,
      driverId: bid.driverId
    });

    logger.info(`Bid accepted: ${bidId} for job ${bid.jobId}, payment pending`);
    return updatedBid;
  }

  /**
   * Decline a bid
   */
  async declineBid(bidId: string): Promise<Bid> {
    // Check if bid exists
    const bid = await this.bidRepository.findOne({ where: { id: bidId } });
    if (!bid) {
      throw new AppError("Bid not found", 404);
    }

    // Update bid status
    bid.status = BidStatus.DECLINED;
    const updatedBid = await this.bidRepository.save(bid);

    logger.info(`Bid declined: ${bidId} for job ${bid.jobId}`);
    return updatedBid;
  }

  /**
   * Counter a bid with a new price
   */
  async counterBid(bidId: string, counterPrice: number): Promise<Bid> {
    // Check if bid exists
    const bid = await this.bidRepository.findOne({
      where: { id: bidId },
      relations: ["job"]
    });

    if (!bid) {
      throw new AppError("Bid not found", 404);
    }

    // Check if job is still available
    if (bid.job.status !== JobStatus.PENDING) {
      throw new AppError("Job is no longer available", 400);
    }

    // Update bid with counter offer
    bid.originalPrice = bid.proposedPrice; // Store the previous proposed price as original
    bid.proposedPrice = counterPrice;
    bid.status = BidStatus.COUNTERED;
    
    const updatedBid = await this.bidRepository.save(bid);
    logger.info(`Bid countered: ${bidId} for job ${bid.jobId} with new price ${counterPrice}`);
    
    return updatedBid;
  }
}

export default new BiddingService(); 