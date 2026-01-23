# Database Setup Guide

## PostgreSQL Container

This project uses PostgreSQL 16 running in a Docker container.

### Quick Start

1. **Start the database:**

   ```bash
   docker compose up -d postgres
   ```

2. **Stop the database:**

   ```bash
   docker compose stop postgres
   ```

3. **View logs:**

   ```bash
   docker compose logs -f postgres
   ```

4. **Access PostgreSQL CLI:**
   ```bash
   docker exec -it 360-degree-postgres psql -U postgres -d degree360
   ```

### Database Configuration

- **Host:** localhost
- **Port:** 5433 (mapped from container's 5432)
- **Username:** postgres
- **Password:** postgres123
- **Database:** degree360

### Environment Variables

Make sure your `.env` file contains:

```env
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=postgres123
DB_NAME=degree360
```

### Additional Services

The docker-compose also includes Redis on port 6379 for caching and queue management.

Start all services:

```bash
docker compose up -d
```

### Data Persistence

Database data is persisted in a Docker volume named `360-degree_postgres_data`. Your data will survive container restarts.

To completely reset the database:

```bash
docker compose down -v  # Warning: This deletes all data!
docker compose up -d postgres
```

### Troubleshooting

**Port already in use?**
If you have a local PostgreSQL running on 5432, the container uses 5433 instead. Update your `.env` accordingly.

**Connection refused?**
Wait a few seconds for the container to fully start, then check:

```bash
docker compose ps
docker compose logs postgres
```
