export enum UserRoles {
  ADMIN = 'admin',
  MANAGER = 'manager',
  DRIVER = 'driver',
  CUSTOMER = 'customer'
}

export enum JobStatus {
  PENDING = 'PENDING',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  ACTIVE = 'ACTIVE',
  PICKUP_ARRIVED = 'PICKUP_ARRIVED',
  PICKUP_COMPLETED = 'PICKUP_COMPLETED',
  DELIVERY_ARRIVED = 'DELIVERY_ARRIVED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum OrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum DriverStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  OFFLINE = 'OFFLINE'
}

export enum ActivityType {
  JOB_CREATED = 'JOB_CREATED',
  JOB_ASSIGNED = 'JOB_ASSIGNED',
  JOB_COMPLETED = 'JOB_COMPLETED',
  PAYMENT_PROCESSED = 'PAYMENT_PROCESSED',
  DRIVER_STATUS_CHANGED = 'DRIVER_STATUS_CHANGED'
}

export enum TruckType {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  XLARGE = 'xlarge'
} 