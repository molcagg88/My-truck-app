# Truck App Admin Panel

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app). It's been extended to include a comprehensive admin panel for a truck application with features for job management, payment tracking, driver locations, and activity logs.

## Project Structure

The project consists of two main parts:

1. **Frontend**: A React Native (Expo) application with a web interface for the admin panel
2. **Backend**: A Node.js Express API serving the admin panel data

## Features

- **Jobs Management**: View and manage jobs, update statuses, assign drivers
- **Payments Dashboard**: Track payments, view statistics, process payment actions
- **Driver Tracking**: Real-time driver locations, status management
- **Activity Logs**: Track system activities and events
- **Authentication**: Secure access with JWT-based authentication

## Setup Instructions

1. Install dependencies

   ```bash
   npm install
   cd server
   npm install
   cd ..
   ```

2. Set up environment variables:
   
   ```bash
   # In the server directory, copy the example env file
   cd server
   cp .env.example .env
   # Edit the .env file with your database credentials
   ```

3. Seed the database with test data:

   ```bash
   cd server
   npm run seed
   ```

4. Start both frontend and backend

   ```bash
   npm run dev
   ```

   This will run both the Expo frontend and the Express backend server concurrently.

5. Alternatively, you can start them separately:

   ```bash
   npm start          # Start frontend (Expo)
   npm run server     # Start backend server
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

The admin panel is optimized for viewing on the web platform.

## Test Users

The following users are available for testing:

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | admin123 | Admin |
| manager@example.com | manager123 | Manager |
| driver@example.com | driver123 | Driver |
| user@example.com | user123 | User |

## API Endpoints

### Auth Routes
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/refresh-token` - Refresh authentication token

### Admin Routes

#### Jobs
- `GET /api/admin/jobs/stats` - Get job statistics
- `GET /api/admin/jobs` - Get all jobs
- `PATCH /api/admin/jobs/:id/status` - Update job status
- `POST /api/admin/jobs/:id/assign` - Assign driver to job

#### Payments
- `GET /api/admin/payments/stats` - Get payment statistics
- `GET /api/admin/payments` - Get all payments
- `GET /api/admin/payments/:id` - Get payment details
- `POST /api/admin/payments/:id/process` - Process payment action

#### Drivers
- `GET /api/admin/drivers/locations` - Get driver locations
- `GET /api/admin/drivers` - Get all drivers
- `PATCH /api/admin/drivers/:id/status` - Update driver status

#### Activities
- `GET /api/admin/activities/recent` - Get recent activities

#### Analytics
- `GET /api/admin/analytics` - Get analytics data with time range parameter

## Authentication

The system uses JWT (JSON Web Tokens) for authentication. To access the admin panel:

1. Log in with admin credentials to receive a token
2. The token is automatically attached to API requests
3. Protected routes verify the token and check user roles

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
