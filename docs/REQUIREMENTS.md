# My Truck App - Requirements Specification

## Project Goals

Create a comprehensive mobile logistics platform that connects customers with truck owners/drivers for efficient and reliable transportation services in Ethiopia. The application aims to streamline the process of booking trucks, tracking deliveries, and managing payments through a user-friendly interface.

## User Roles

### 1. Customer
- Individuals or businesses who need to transport goods
- Can book trucks, track deliveries, and make payments
- Access to order history and delivery status

### 2. Driver
- Truck owners or drivers who provide transportation services
- Can accept or decline job requests
- Track earnings and manage their profile
- Navigate to pickup and delivery locations

### 3. Affiliate
- Partners who refer customers or drivers to the platform
- Track referrals and commissions
- Access to performance analytics

## Core Features

### Authentication & User Management
- Phone number-based registration and login
- OTP verification via GeezSMS integration
- User profile management
- Role-based access control

### Customer Features
- Location selection (pickup and destination)
- Truck type selection based on cargo needs
- Real-time price estimation
- Order tracking with live map
- Payment processing
- Order history and status tracking
- Driver rating and feedback

### Driver Features
- Job request notifications
- Job details view with location information
- Navigation assistance to pickup and delivery locations
- Earnings tracking and history
- Customer communication tools

### Payment System
- Telebirr integration for digital payments
- Cash on delivery option
- Payment verification and receipt generation
- Transaction history

### Tracking System
- Real-time location tracking
- Delivery status updates
- Estimated time of arrival
- Route visualization

## Technical Requirements

### Mobile Application
- Cross-platform support (iOS and Android)
- Responsive design for various screen sizes
- Offline capability for critical features
- Dark mode support

### API Integrations
- Telebirr API for payment processing
- GeezSMS API for OTP verification
- Maps API for location and navigation services

### Performance Requirements
- Fast loading times (under 3 seconds)
- Smooth animations and transitions
- Efficient battery usage
- Minimal data consumption

### Security Requirements
- Secure user authentication
- Encrypted data transmission
- Secure payment processing
- Privacy compliance

## Future Enhancements

- Multi-language support (Amharic, English)
- Advanced analytics for drivers and customers
- Loyalty program for frequent customers
- Scheduled bookings for regular transportation needs
- Fleet management for companies with multiple trucks
