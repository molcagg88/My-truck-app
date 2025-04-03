import { AppDataSource } from '../config/database';
import { Job } from '../entities/Job';
import { Driver } from '../entities/Driver';
import { Payment } from '../entities/Payment';
import { Activity } from '../entities/Activity';
import { User } from '../entities/User';
import { UserRoles } from '../types/enums';
import fs from 'fs';
import path from 'path';
import { JobStatus, PaymentStatus, DriverStatus, ActivityType } from '../types/enums';
import { randomDate, randomGeoPoint, randomItem, randomJobStatus, getPaymentStatusForJob } from '../utils/seedHelpers';
import bcrypt from 'bcryptjs';

// Base coordinates for New York City
const NYC_LAT = 40.7128;
const NYC_LNG = -74.0060;

// Ensure required directories exist
const ensureDirectories = () => {
  const dataDir = path.join(__dirname, '..', '..', 'data');
  if (!fs.existsSync(dataDir)) {
    console.log('Creating data directory...');
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const seedDir = path.join(__dirname);
  if (!fs.existsSync(seedDir)) {
    console.log('Creating seed directory...');
    fs.mkdirSync(seedDir, { recursive: true });
  }
};

// Seed data
const seedDrivers = [
  {
    name: "John Doe",
    status: DriverStatus.AVAILABLE,
    currentLocation: {
      ...randomGeoPoint(NYC_LAT, NYC_LNG, 10),
      timestamp: randomDate(1, 0)
    }
  },
  {
    name: "Jane Smith",
    status: DriverStatus.BUSY,
    currentLocation: {
      ...randomGeoPoint(NYC_LAT, NYC_LNG, 8),
      timestamp: randomDate(1, 0)
    }
  },
  {
    name: "Robert Johnson",
    status: DriverStatus.AVAILABLE,
    currentLocation: {
      ...randomGeoPoint(NYC_LAT, NYC_LNG, 15),
      timestamp: randomDate(1, 0)
    }
  },
  {
    name: "Sarah Williams",
    status: DriverStatus.OFFLINE,
    currentLocation: null
  },
  {
    name: "Michael Brown",
    status: DriverStatus.AVAILABLE,
    currentLocation: {
      ...randomGeoPoint(NYC_LAT, NYC_LNG, 5),
      timestamp: randomDate(1, 0)
    }
  }
];

// Job titles and descriptions
const jobTypes = [
  { title: "Furniture Delivery", description: "Deliver a sofa and two chairs to downtown apartment" },
  { title: "Office Supplies Transport", description: "Transport office equipment to new location" },
  { title: "Grocery Delivery", description: "Deliver weekly groceries to elderly residents" },
  { title: "Construction Materials", description: "Deliver building materials to construction site" },
  { title: "Restaurant Supplies", description: "Deliver food supplies to local restaurant" },
  { title: "Medical Equipment", description: "Transport medical equipment to hospital" },
  { title: "Electronic Delivery", description: "Deliver computers and electronics to tech company" },
  { title: "Clothing Shipment", description: "Transport clothing items to retail store" },
  { title: "Moving Service", description: "Help customer move to new apartment" },
  { title: "Appliance Delivery", description: "Deliver and install new appliances" }
];

// Generate dynamic seed jobs
const generateSeedJobs = (count: number) => {
  return Array.from({ length: count }, () => {
    const jobType = randomItem(jobTypes);
    const status = randomJobStatus();
    
    return {
      title: jobType.title,
      description: jobType.description,
      status,
      amount: parseFloat((Math.random() * 200 + 50).toFixed(2)),
      createdAt: randomDate(30, 1) // Created within the last 30 days
    };
  });
};

const seedJobs = generateSeedJobs(20);

const generateActivityDescription = (type: ActivityType, entity: any): string => {
  switch (type) {
    case ActivityType.JOB_CREATED:
      return `New job created: ${entity.title}`;
    case ActivityType.JOB_UPDATED:
      return `Job updated: ${entity.title} - Status changed to ${entity.status}`;
    case ActivityType.PAYMENT_PROCESSED:
      return `Payment processed: $${entity.amount} - Status: ${entity.status}`;
    case ActivityType.DRIVER_STATUS_CHANGED:
      return `Driver status changed: ${entity.name} is now ${entity.status}`;
    default:
      return 'Activity logged';
  }
};

// Add seed users data
const seedUsers = [
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123",
    role: UserRoles.ADMIN,
    phone: "+251911234567",
    isEmailVerified: true,
    isPhoneVerified: true
  },
  {
    name: "Manager User",
    email: "manager@example.com",
    password: "manager123",
    role: UserRoles.MANAGER,
    phone: "+251922345678",
    isEmailVerified: true,
    isPhoneVerified: true
  },
  {
    name: "Driver User",
    email: "driver@example.com",
    password: "driver123",
    role: UserRoles.DRIVER,
    phone: "+251933456789",
    isEmailVerified: true,
    isPhoneVerified: true
  },
  {
    name: "Customer User",
    email: "customer@example.com",
    password: "customer123",
    role: UserRoles.CUSTOMER,
    phone: "+251944567890",
    isEmailVerified: true,
    isPhoneVerified: true
  }
];

export const seed = async () => {
  try {
    // Ensure directories exist
    ensureDirectories();

    // Initialize the database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    console.log('Database initialized successfully');
    
    // Create users
    console.log('Creating users...');
    const userRepository = AppDataSource.getRepository(User);
    const userEntities = [];
    
    for (const userData of seedUsers) {
      // Check if user already exists
      const existingUser = await userRepository.findOne({ where: { email: userData.email } });
      if (!existingUser) {
        // Create new user
        const user = new User();
        user.name = userData.name;
        user.email = userData.email;
        user.password = await bcrypt.hash(userData.password, 10);
        user.phone = userData.phone;
        user.role = userData.role;
        user.isEmailVerified = userData.isEmailVerified;
        user.isPhoneVerified = userData.isPhoneVerified;
        
        const savedUser = await userRepository.save(user);
        console.log(`User created: ${savedUser.name} (${savedUser.role}) with ID: ${savedUser.id}`);
        userEntities.push(savedUser);
      } else {
        console.log(`User already exists: ${existingUser.name} (${existingUser.email})`);
        userEntities.push(existingUser);
      }
    }
    
    // Clear existing data (optional)
    console.log('Clearing existing data...');
    await AppDataSource.getRepository(Activity).clear();
    await AppDataSource.getRepository(Payment).clear();
    await AppDataSource.getRepository(Job).clear();
    await AppDataSource.getRepository(Driver).clear();

    // Seed drivers
    console.log('Seeding drivers...');
    const driverEntities = await Promise.all(
      seedDrivers.map(driverData => {
        const driver = new Driver();
        Object.assign(driver, driverData);
        return AppDataSource.getRepository(Driver).save(driver);
      })
    );

    // Seed jobs and assign some to drivers
    console.log('Seeding jobs...');
    const jobEntities = await Promise.all(
      seedJobs.map((jobData, index) => {
        const job = new Job();
        Object.assign(job, jobData);
        
        // Assign some jobs to drivers (70% of jobs get assigned)
        if (Math.random() < 0.7) {
          const driverIndex = index % driverEntities.length;
          job.driver = driverEntities[driverIndex];
          job.driverId = driverEntities[driverIndex].id;
          
          // If driver is assigned and job is active, set driver to busy
          if (job.status === JobStatus.ACTIVE) {
            driverEntities[driverIndex].status = DriverStatus.BUSY;
          }
        }
        
        return AppDataSource.getRepository(Job).save(job);
      })
    );

    // Update any changed driver statuses
    await Promise.all(
      driverEntities.map(driver => 
        AppDataSource.getRepository(Driver).save(driver)
      )
    );

    // Create payments for completed and active jobs
    console.log('Creating payments...');
    const paymentEntities = await Promise.all(
      jobEntities
        .filter(job => job.status !== JobStatus.PENDING)
        .map(job => {
          const payment = new Payment();
          payment.jobId = job.id;
          payment.amount = job.amount;
          payment.status = getPaymentStatusForJob(job.status as JobStatus);
          
          const processedDate = job.status === JobStatus.COMPLETED 
            ? randomDate(7, 1) // Processed within the last week
            : null;
            
          payment.metadata = {
            processedAt: processedDate,
            paymentMethod: randomItem(['credit_card', 'bank_transfer', 'cash']),
            notes: job.status === JobStatus.CANCELLED ? 'Order cancelled by customer' : ''
          };
          
          return AppDataSource.getRepository(Payment).save(payment);
        })
    );

    // Create activity logs
    console.log('Creating activity logs...');
    const activities = [];

    // Job creation activities
    for (const job of jobEntities) {
      const activity = new Activity();
      activity.type = ActivityType.JOB_CREATED;
      activity.description = generateActivityDescription(ActivityType.JOB_CREATED, job);
      activity.metadata = { 
        jobId: job.id,
        timestamp: job.createdAt
      };
      activities.push(activity);
      
      // Add status update activities for non-pending jobs
      if (job.status !== JobStatus.PENDING) {
        const statusActivity = new Activity();
        statusActivity.type = ActivityType.JOB_UPDATED;
        statusActivity.description = generateActivityDescription(ActivityType.JOB_UPDATED, job);
        statusActivity.metadata = { 
          jobId: job.id,
          oldStatus: JobStatus.PENDING,
          newStatus: job.status,
          timestamp: randomDate(15, 1) // Status changed within last 15 days
        };
        activities.push(statusActivity);
      }
    }

    // Payment activities
    for (const payment of paymentEntities) {
      if (payment.status !== PaymentStatus.PENDING) {
        const activity = new Activity();
        activity.type = ActivityType.PAYMENT_PROCESSED;
        activity.description = generateActivityDescription(ActivityType.PAYMENT_PROCESSED, payment);
        activity.metadata = { 
          paymentId: payment.id,
          jobId: payment.jobId,
          timestamp: payment.metadata.processedAt || randomDate(10, 1)
        };
        activities.push(activity);
      }
    }

    // Driver status activities
    for (const driver of driverEntities) {
      const activity = new Activity();
      activity.type = ActivityType.DRIVER_STATUS_CHANGED;
      activity.description = generateActivityDescription(ActivityType.DRIVER_STATUS_CHANGED, driver);
      activity.metadata = { 
        driverId: driver.id,
        timestamp: randomDate(5, 0) // Status changed within last 5 days
      };
      activities.push(activity);
    }

    await AppDataSource.getRepository(Activity).save(activities);

    // Save seed data to file for reference
    const exportData = {
      drivers: driverEntities,
      jobs: jobEntities,
      payments: paymentEntities,
      activities: activities
    };

    fs.writeFileSync(
      path.join(path.join(__dirname), 'data.json'),
      JSON.stringify(exportData, null, 2)
    );

    console.log('Database seeding completed successfully!');
    console.log(`Created: ${driverEntities.length} drivers, ${jobEntities.length} jobs, ${paymentEntities.length} payments, ${activities.length} activities`);

    // Optional: Close the database connection
    // await AppDataSource.destroy();
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

// Run the seed function if this script is executed directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log('Seed script completed.');
      process.exit(0);
    })
    .catch(error => {
      console.error('Seed script failed:', error);
      process.exit(1);
    });
} 