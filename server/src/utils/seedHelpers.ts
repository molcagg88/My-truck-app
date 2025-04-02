import { randomUUID } from 'crypto';
import { JobStatus, PaymentStatus, DriverStatus, ActivityType } from '../types/enums';

/**
 * Generate a random date within a specified range
 * @param startDays Number of days ago to start range
 * @param endDays Number of days ago to end range (default: 0 for today)
 * @returns Random date within the range
 */
export const randomDate = (startDays: number, endDays: number = 0): Date => {
  const start = new Date();
  start.setDate(start.getDate() - startDays);
  
  const end = new Date();
  end.setDate(end.getDate() - endDays);
  
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

/**
 * Generate a random GPS coordinate around a base location
 * @param baseLat Base latitude
 * @param baseLng Base longitude
 * @param radiusKm Radius in kilometers
 * @returns Random coordinates
 */
export const randomGeoPoint = (
  baseLat: number, 
  baseLng: number, 
  radiusKm: number = 5
): { latitude: number; longitude: number } => {
  // Convert radius from kilometers to degrees
  const radiusDegrees = radiusKm / 111;
  
  // Generate random points within a circle
  const u = Math.random();
  const v = Math.random();
  const w = radiusDegrees * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);
  
  // Adjust the x-coordinate for the shrinking of the east-west distances
  const newLng = x / Math.cos(baseLat * Math.PI / 180) + baseLng;
  const newLat = y + baseLat;
  
  return {
    latitude: Number(newLat.toFixed(6)),
    longitude: Number(newLng.toFixed(6))
  };
};

/**
 * Select a random item from an array
 * @param array Array to select from
 * @returns Random item from the array
 */
export const randomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Generate a random job status with weighted distribution
 * @returns Random JobStatus
 */
export const randomJobStatus = (): JobStatus => {
  const statuses = [
    { status: JobStatus.PENDING, weight: 3 },
    { status: JobStatus.ACTIVE, weight: 4 },
    { status: JobStatus.COMPLETED, weight: 2 },
    { status: JobStatus.CANCELLED, weight: 1 }
  ];
  
  // Calculate total weight
  const totalWeight = statuses.reduce((sum, item) => sum + item.weight, 0);
  
  // Generate a random number between 0 and totalWeight
  let random = Math.random() * totalWeight;
  
  // Find the status that corresponds to the random number
  for (const item of statuses) {
    random -= item.weight;
    if (random <= 0) {
      return item.status;
    }
  }
  
  // Fallback
  return JobStatus.PENDING;
};

/**
 * Generate a consistent payment status based on job status
 * @param jobStatus The job status
 * @returns Appropriate payment status
 */
export const getPaymentStatusForJob = (jobStatus: JobStatus): PaymentStatus => {
  switch (jobStatus) {
    case JobStatus.COMPLETED:
      return PaymentStatus.PROCESSED;
    case JobStatus.CANCELLED:
      return randomItem([PaymentStatus.FAILED, PaymentStatus.PENDING]);
    case JobStatus.ACTIVE:
      return PaymentStatus.PENDING;
    default:
      return PaymentStatus.PENDING;
  }
};

/**
 * Generate a UUID for testing purposes
 * @returns UUID string
 */
export const generateTestId = (): string => {
  return randomUUID();
}; 