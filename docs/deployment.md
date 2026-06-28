# DocuFlow AI — Deployment Guide

This guide describes how to deploy **DocuFlow AI** to local development, staging, or production environments.

---

## 1. Docker Compose Structure
The platform is packaged to run within standard isolated Docker containers. The `infra/docker-compose.yml` config defines the services:

* **db**: PostgreSQL 16 image serving persistence data.
* **redis**: Redis 7 image for query cache buffers.
* **api**: FastAPI application served by Uvicorn.
* **frontend**: TanStack Start React SPA served on Vite dev.

---

## 2. Environment Variables Configuration

Create a `.env` file in the root directory.

```ini
# Database Settings
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=docuflow
DATABASE_URL=postgresql://postgres:postgres@db:5432/docuflow

# Security
SECRET_KEY=supersecretkeyreplaceinproductionenvironment
ACCESS_TOKEN_EXPIRE_MINUTES=30

# File Storage
UPLOAD_DIR=/app/uploads

# Client Base URL (Vite environment)
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## 3. Production Hardening Checklist

When preparing to move to a production server environment:
* [ ] **Secret Key**: Overwrite `SECRET_KEY` with a cryptographically secure randomly generated string.
* [ ] **DB Authentication**: Set custom usernames/passwords for PostgreSQL, avoiding default values.
* [ ] **HTTPS / Reverse Proxy**: Deploy an Nginx or Traefik reverse proxy to encrypt transport layers (HTTPS/SSL) and map static assets.
* [ ] **Folder Permissions**: Restrict write permissions on `/app/uploads` only to the running FastAPI process.
* [ ] **Database Backup**: Set up cron jobs to run periodic PostgreSQL backups.
