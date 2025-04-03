# My Truck App

A modern mobile application for booking trucks and managing deliveries, built with Expo and React Native.

## About

My Truck is a comprehensive solution for connecting customers with truck drivers for various delivery needs. The app provides an intuitive interface for booking trucks, tracking deliveries, and managing payments.

## Features

- **Phone Number Authentication**: All users are identified by their phone numbers. One-Time Passwords (OTP) are used for secure authentication.
- **Multi-Role System**: Support for customers, drivers, and administrators.
- **Truck Booking**: Book different types of trucks based on your delivery needs.
- **Real-Time Tracking**: Track your delivery in real-time.
- **Driver Management**: For drivers to accept jobs and manage their schedule.
- **Admin Dashboard**: For managing users, tracking metrics, and more.
- **Payment Integration**: Secure payment processing with multiple payment options.

## Authentication Approach

My Truck uses phone number as the primary identifier for all users. This approach offers several benefits:

- **Simplicity**: Users don't need to remember passwords
- **Security**: OTP verification provides strong security
- **Accessibility**: Works for users without email addresses
- **Regional Relevance**: Better suited for markets where phone numbers are the primary means of communication

Email addresses are optional and can be added to the user's profile if desired.

## Technologies Used

- **Frontend**: React Native, Expo, NativeWind (TailwindCSS)
- **Backend**: Node.js, Express, TypeORM
- **Database**: PostgreSQL
- **Authentication**: JWT, SMS-based OTP
- **Payments**: Multiple payment gateway integrations

## Project Structure

The project follows a monorepo structure:

- `/app` - React Native Expo application
- `/server` - Express backend API

## Getting Started

### Prerequisites

- Node.js 14+
- npm or yarn
- Expo CLI
- PostgreSQL (optional, for full functionality)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/my-truck-app.git
cd my-truck-app
```

2. Install dependencies:
```bash
npm install
cd server
npm install
cd ..
```

3. Set up environment variables:
```bash
cp .env.example .env
cd server
cp .env.example .env
cd ..
```

4. Start the development servers:
```bash
npm run dev
```

### Test Accounts

For testing purposes, the following accounts are available:

| Phone Number | Role    |
|--------------|---------|
| +251900000001 | Customer |
| +251900000002 | Driver  |
| +251900000003 | Admin   |

## License

This project is licensed under the MIT License - see the LICENSE file for details.
