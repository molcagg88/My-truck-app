# Server Setup Guide

This guide will help you set up the server component of the truck application admin panel.

## Prerequisites

- Node.js 14+ installed
- npm 6+ installed

## Installation

1. Install dependencies:

```bash
cd server
npm install
```

2. Create required directories:

```bash
mkdir -p data
```

3. Set up environment:

```bash
# Copy the example env file
cp .env.example .env
```

4. Configure database:
   
   By default, the app uses SQLite which requires no additional setup. If you want to use PostgreSQL, update the .env file with your PostgreSQL credentials.

## Running the Application

### Development Mode

```bash
# Run in development mode with hot reloading
npm run dev
```

### Production Mode

```bash
# Build TypeScript code
npm run build

# Start the server
npm start
```

## Seeding the Database

Populate the database with test data:

```bash
npm run seed
```

## Troubleshooting

### TypeScript Errors

If you encounter TypeScript errors related to decorators, make sure your `tsconfig.json` has these options enabled:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strictPropertyInitialization": false
  }
}
```

### Database Connection Issues

- **SQLite**: Make sure the `data` directory exists and is writable
- **PostgreSQL**: Check that PostgreSQL is running and the connection details in `.env` are correct

### Missing Files or Directories

If you encounter errors about missing files or directories, manually create them:

```bash
mkdir -p data
mkdir -p src/seeds
```

## Test Users

The following users are created when seeding the database:

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | admin123 | Admin |
| manager@example.com | manager123 | Manager |
| driver@example.com | driver123 | Driver |
| user@example.com | user123 | User | 