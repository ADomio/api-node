# Traffic Distribution System - Node.js API

This is the Node.js API service for the Traffic Distribution System (TDS). It provides a RESTful API for managing campaigns, streams, filters, and traffic sources.

## Overview

The Traffic Distribution System is a platform for managing and optimizing traffic distribution across multiple streams based on various criteria. This Node.js API service serves as the backend for the TDS frontend application, providing endpoints for:

- Campaign management
- Stream configuration
- Filter rules
- Traffic source management
- Campaign reporting

## Technology Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **API Documentation**: Swagger
- **Testing**: Jest

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- Redis (optional)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration.

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

### Running the Application

#### Development Mode

```bash
npm run start:dev
```

#### Production Mode

```bash
npm run build
npm run start:prod
```

## API Documentation

Once the application is running, you can access the Swagger API documentation at:

```
http://localhost:5001/api
```

## Project Structure

```
api-node/
├── src/                    # Source code
│   ├── campaign/           # Campaign module
│   ├── stream/             # Stream module
│   ├── filter/             # Filter module
│   ├── traffic-source/     # Traffic source module
│   ├── prisma/             # Prisma service
│   ├── redis/              # Redis service
│   ├── config/             # Configuration
│   ├── app.module.ts       # Main application module
│   └── main.ts             # Application entry point
├── prisma/                 # Prisma schema and migrations
├── test/                   # Test files
└── package.json            # Project dependencies and scripts
```

## API Endpoints

### Campaigns

- `GET /campaigns` - Get all campaigns
- `GET /campaigns/:id` - Get a campaign by ID
- `GET /campaigns/code/:code` - Get a campaign by code
- `POST /campaigns` - Create a new campaign
- `PATCH /campaigns/:id` - Update a campaign
- `DELETE /campaigns/:id` - Delete a campaign

### Streams

- `GET /streams` - Get all streams
- `GET /streams/:id` - Get a stream by ID
- `GET /campaigns/:id/streams` - Get streams for a campaign
- `POST /campaigns/:id/streams` - Create a new stream for a campaign
- `PATCH /streams/:id` - Update a stream
- `DELETE /streams/:id` - Delete a stream

### Filters

- `GET /filters` - Get all filters
- `GET /filters/:id` - Get a filter by ID
- `GET /streams/:id/filters` - Get filters for a stream
- `POST /streams/:id/filters` - Create a new filter for a stream
- `PATCH /filters/:id` - Update a filter
- `DELETE /filters/:id` - Delete a filter

### Traffic Sources

- `GET /traffic-sources` - Get all traffic sources
- `GET /traffic-sources/:id` - Get a traffic source by ID
- `POST /traffic-sources` - Create a new traffic source
- `PATCH /traffic-sources/:id` - Update a traffic source
- `DELETE /traffic-sources/:id` - Delete a traffic source

## Database Schema

The application uses PostgreSQL with the following main entities:

- **Campaign**: Represents a marketing campaign with streams and financial data
- **Stream**: Represents a traffic destination with filters and weight
- **Filter**: Represents rules for filtering traffic based on various criteria
- **TrafficSource**: Represents a source of traffic with query parameters

## Testing

Run tests with:

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Docker

A Dockerfile is provided for containerized deployment. Build and run with:

```bash
docker build -t api-node .
docker run -p 5001:5001 api-node
```
