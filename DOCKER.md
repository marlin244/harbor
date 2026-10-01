# Harbor — Docker Deployment Guide

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- 2GB RAM minimum
- 10GB disk space

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd Harbor
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.docker.example .env.docker

# Edit with your configuration
nano .env.docker
```

### 3. Build and Run

```bash
# Build the Docker image
docker-compose build

# Start the services
docker-compose up -d

# Check logs
docker-compose logs -f backend
```

### 4. Initialize Database

```bash
# Run migrations
docker-compose exec backend pnpm db:push
```

The application will be available at `http://localhost:3000`

---

## Services

### Backend API
- **Port**: 3000
- **Container**: roomassets-backend
- **Framework**: Express + tRPC
- **Health Check**: Every 30 seconds

### MySQL Database
- **Port**: 3306
- **Container**: roomassets-db
- **Version**: 8.0
- **Database**: roomassets
- **User**: roomassets

---

## Common Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f db
```

### Execute Commands
```bash
# Run migrations
docker-compose exec backend pnpm db:push

# Access database
docker-compose exec db mysql -u roomassets -p roomassets
```

### Rebuild Image
```bash
docker-compose build --no-cache
```

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (production/development) | Yes |
| `DATABASE_URL` | MySQL connection string | Yes |
| `PORT` | Server port | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `VITE_APP_ID` | OAuth application ID | No |
| `OAUTH_SERVER_URL` | OAuth server URL | No |
| `VITE_OAUTH_PORTAL_URL` | OAuth portal URL | No |
| `OWNER_OPEN_ID` | Owner's OpenID | No |
| `OWNER_NAME` | Owner's name | No |
| `BUILT_IN_FORGE_API_URL` | Manus API URL | No |
| `BUILT_IN_FORGE_API_KEY` | Manus API key | No |

---

## Database Management

### Backup Database
```bash
docker-compose exec db mysqldump -u roomassets -p roomassets > backup.sql
```

### Restore Database
```bash
docker-compose exec -T db mysql -u roomassets -p roomassets < backup.sql
```

### Access Database Shell
```bash
docker-compose exec db mysql -u roomassets -p roomassets
```

---

## Troubleshooting

### Port Already in Use
```bash
# Change port in docker-compose.yml
# Or kill existing process
lsof -i :3000
kill -9 <PID>
```

### Database Connection Error
```bash
# Check database health
docker-compose exec db mysqladmin ping -h localhost

# Check logs
docker-compose logs db
```

### Build Failures
```bash
# Clean and rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Permission Issues
```bash
# Run with sudo if needed
sudo docker-compose up -d
```

---

## Production Deployment

### Security Considerations

1. **Change JWT_SECRET** - Use a strong, random secret
2. **Update Database Credentials** - Change default username/password
3. **Enable SSL/TLS** - Use reverse proxy (nginx, Traefik)
4. **Environment Secrets** - Use Docker secrets or external secret management
5. **Resource Limits** - Set CPU and memory limits in docker-compose.yml

### Example Production Configuration

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    restart: always
```

### Scaling

For horizontal scaling, use Docker Swarm or Kubernetes:

```bash
# Docker Swarm
docker stack deploy -c docker-compose.yml roomassets

# Kubernetes
kubectl apply -f k8s-deployment.yaml
```

---

## Monitoring

### Health Check Status
```bash
docker-compose ps
```

### Resource Usage
```bash
docker stats
```

### View Metrics
```bash
docker-compose exec backend curl http://localhost:3000/health
```

---

## Support

For issues or questions, refer to:
- [Project README](./README.md)
- [API Documentation](./docs/SPEC.md)
- [Database Schema](./docs/DATA.md)
