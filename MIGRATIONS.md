# Database Migrations Guide

This guide explains how to run Entity Framework Core migrations using the migration-specific Docker setup.

## Overview

The project includes a special Docker configuration for running EF Core migrations without needing the .NET SDK installed on your host machine or in your production containers.

## Files

- **Dockerfile.migrations** - Docker image with .NET SDK and EF Core tools
- **migrate.sh** - Helper script for running migrations easily
- **docker-compose.yml** - Includes a `migrate` service for running migrations

## Method 1: Using Docker Compose (Recommended)

The easiest way to run migrations is using the `migrate` service in docker-compose:

### Update Database to Latest Migration

```bash
docker-compose run --rm migrate database update
```

### List All Migrations

```bash
docker-compose run --rm migrate migrations list
```

### View Migration Details

```bash
docker-compose run --rm migrate migrations list --verbose
```

### Create a New Migration

```bash
docker-compose run --rm migrate migrations add YourMigrationName
```

### Remove the Last Migration (if not applied)

```bash
docker-compose run --rm migrate migrations remove
```

### Generate SQL Script

```bash
docker-compose run --rm migrate migrations script --output /app/migration.sql
```

### Get Help

```bash
docker-compose run --rm migrate --help
```

## Method 2: Using the migrate.sh Script

The `migrate.sh` script builds the migration image and runs commands:

### Make the script executable (first time only)

```bash
chmod +x migrate.sh
```

### Update Database

```bash
./migrate.sh database update
```

### List Migrations

```bash
./migrate.sh migrations list
```

### Create New Migration

```bash
./migrate.sh migrations add YourMigrationName
```

## Method 3: Manual Docker Commands

If you prefer more control, you can build and run the migration container manually:

### Build the Migration Image

```bash
docker build -f Dockerfile.migrations -t whattoeat-migrations .
```

### Run Migration Commands

```bash
# Update database
docker run --rm \
  --network what-to-eat_default \
  -e ConnectionStrings__DefaultConnection="Host=postgres;Port=5432;Database=whattoeat;Username=postgres;Password=postgres" \
  whattoeat-migrations database update

# List migrations
docker run --rm \
  --network what-to-eat_default \
  -e ConnectionStrings__DefaultConnection="Host=postgres;Port=5432;Database=whattoeat;Username=postgres;Password=postgres" \
  whattoeat-migrations migrations list
```

## Connecting to Different Databases

### Local Development (default)

The default connection string connects to the postgres container in docker-compose:
```
Host=postgres;Port=5432;Database=whattoeat;Username=postgres;Password=postgres
```

### Production or Remote Database

Override the connection string using the environment variable:

```bash
# Using docker-compose
DATABASE_URL="Host=your-server;Port=5432;Database=whattoeat;Username=user;Password=pass" \
  docker-compose run --rm migrate database update

# Using the script
DATABASE_URL="Host=your-server;Port=5432;Database=whattoeat;Username=user;Password=pass" \
  ./migrate.sh database update
```

## Common Tasks

### Apply All Pending Migrations

```bash
docker-compose run --rm migrate database update
```

### Rollback to a Specific Migration

```bash
docker-compose run --rm migrate database update MigrationName
```

### Check Which Migrations Are Applied

```bash
docker-compose run --rm migrate migrations list
```

### Create a Migration for Schema Changes

1. Make changes to your entity models in the code
2. Run:
   ```bash
   docker-compose run --rm migrate migrations add DescriptiveNameForChanges
   ```
3. Review the generated migration files in `src/WhatToEat.API/Migrations/`
4. Apply the migration:
   ```bash
   docker-compose run --rm migrate database update
   ```

## Troubleshooting

### Network Error

If you get a network error, ensure your docker-compose stack is running:
```bash
docker-compose up -d postgres
```

### Connection Refused

Wait for PostgreSQL to be ready:
```bash
docker-compose ps postgres
```

Look for the "healthy" status before running migrations.

### Permission Denied on migrate.sh

Make the script executable:
```bash
chmod +x migrate.sh
```

## Notes

- The migration container uses the .NET SDK 8.0
- EF Core tools version matches your project (8.0.x)
- The `migrate` service in docker-compose has a `tools` profile, so it won't start automatically with `docker-compose up`
- The migration container is removed after each run (`--rm` flag) to keep your system clean
