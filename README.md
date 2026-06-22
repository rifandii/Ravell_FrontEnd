# 🌐 Ravell Networks Tech Blog & Knowledge Base

Welcome to the **Ravell Networks** technical blog and knowledge base project. This platform is a fully integrated ecosystem designed for professionals in **Network Engineering** and **Cybersecurity**, providing high-performance reading, security-hardened backend APIs, and seamless database integration.

---

## 📋 Table of Contents

1. [Architectural Overview](#-architectural-overview)
2. [Frontend Documentation](#-frontend-documentation)
3. [Backend Documentation](#-backend-documentation)
4. [Database & Storage Integration](#-database--storage-integration)
5. [Cloudflare & Network Security Setup](#-cloudflare--network-security-setup)
6. [Deployment & Server Configurations](#-deployment--server-configurations)
7. [Local Setup & Deployment Guides](#-local-setup--deployment-guides)

---

## 🏛️ Architectural Overview

The application is deployed across a secure, distributed cloud infrastructure. The following diagram illustrates the lifecycle of a request and the interactions between different layers of the platform:

```
╔══════════════════════════════════════════════════════════════════╗
║                         CLIENT / USER                           ║
║                    (Browser / Mobile App)                       ║
╚══════════════════════════════╦═══════════════════════════════════╝
                               ║
                               ▼ [HTTPS Request via Cloudflare]
╔══════════════════════════════════════════════════════════════════╗
║                    CLOUDFLARE EDGE SERVERS                       ║
║        SSL/TLS (Full Strict), DDoS & Bot Mitigation, WAF         ║
╚══════════════════════════════╦═══════════════════════════════════╝
                               ║
             ┌─────────────────┴─────────────────┐
             ▼ [Route Frontend]                  ▼ [Route Backend API]
╔═════════════════════════════╗     ╔═════════════════════════════╗
║      VERCEL HOSTING         ║     ║   TENCENT CLOUD LIGHTHOUSE  ║
║    https://ravell.tech      ║     ║   https://api.ravell.tech   ║
║                             ║     ║                             ║
║  React + Vite SPA Bundle    ║     ║  ┌───────────────────────┐  ║
║  Tailwind CSS v4            ║     ║  │ Nginx (Reverse Proxy) │  ║
║  React Router v7            ║     ║  └───────────┬───────────┘  ║
║  Contextual SEO & Head      ║     ║              │ Port 8000    ║
║                             ║     ║  ┌───────────▼───────────┐  ║
║  Fetches data via API       ║     ║  │ Gunicorn WSGI Server  │  ║
║  with robust verification  ║     ║  └───────────┬───────────┘  ║
║  and correction layers      ║     ║              │              ║
║                             ║     ║  ┌───────────▼───────────┐  ║
║                             ║     ║  │ Django API Framework  │  ║
║                             ║     ║  └───────────────────────┘  ║
╚═════════════════════════════╝     ╚══════════════╦══════════════╝
                                                   ║
                                   ┌───────────────┴───────────────┐
                                   ▼ [PostgreSQL Queries]          ▼ [S3 Object Uploads]
                            ╔═════════════════════════════╗ #   ╔═════════════════════════════╗
                            ║     SUPABASE POSTGRESQL     ║     ║      SUPABASE STORAGE       ║
                            ║     Database & Indexing     ║     ║    S3-Compatible Bucket     ║
                            ╚═════════════════════════════╝     ╚═════════════════════════════╝
```

---

## 🎨 Frontend Documentation

The frontend is built as a single-page application prioritizing high performance, premium UI/UX design, and responsiveness.

### 💻 Technology Stack
- **Framework & Runtime**: React 19, Vite 7
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Lucide React (Icons)
- **Routing**: React Router v7
- **SEO & Meta Management**: `react-helmet-async` (Dynamic tags, Open Graph protocols, Twitter Cards)
- **Markdown Processing**: `react-markdown`, `remark-gfm`

### ✨ Key Features
- **Holy Grail Layout**: Three-column responsive grid with a sticky left menu, clean reading viewport, and a context-aware table of contents/archive timeline on the right.
- **Smart Theme Engine**: Dark/Light mode support with persistence in local storage and automatic system preference detection.
- **Micro-animations**: Smooth fade-in, slide-in effects, and a dynamic reading progress indicator bar.
- **Image Lightboxes**: Interactive modal overlays with click-to-zoom for analyzing detailed diagrams and technical flowcharts.
- **Auto-Correction & Slug Validation**:
  - Validates `tag_name` and `category_name` search parameters directly against the database (via API).
  - Automatically corrects altered URL display names in the address bar (e.g. `tag_name=Random` -> `tag_name=Cisco`).
  - Gracefully redirects to a "Content Unavailable" screen with navigation fallbacks (Go Back, Home, Browse Articles) if the tag or category slug does not exist in the database (e.g. `tags__slug=nonexistent`).
- **SEO Optimization**: Unique page headings, descriptive meta descriptions, and semantic HTML structure.

---

## ⚙️ Backend Documentation

The backend is a secure, performant RESTful API powered by Django, structured to serve clean JSON representations of articles, categories, and tags using Django Ninja.

### 💻 Technology Stack
- **Web Framework**: Python 3.12, Django 6.0.6
- **API Interface**: Django Ninja 1.6.2 (Fast, Type-Safe API framework based on Pydantic & async support)
- **WSGI Server**: Gunicorn 26.0.0 (running 3 parallel workers)
- **Web Server**: Nginx 1.24.0 (terminating SSL, serving static files, proxying API requests)
- **Static File Compression**: Whitenoise 6.12.0

### ✨ Key Features
- **Paginator & Filters**: Custom pagination class (`CustomPagination` inheriting from Ninja's `PaginationBase`) simulating Django REST Framework's envelope structure (providing `count`, `next`, `previous`, and `results` keys), supporting dynamic `page_size` filtering, tag/category filtering, and multi-query search inputs.
- **Hierarchical Categories**: Self-referencing recursive models allowing nested parent-child categories, represented dynamically via recursive Pydantic schemas.
- **Timeline Archives**: Custom endpoint (`/api/archives/`) grouping article summaries chronologically by year and month.
- **Random Recommendations**: An endpoint (`/api/articles/random_articles/`) fetching contextual reading recommendations, excluding the active article.
- **Interactive OpenAPI Documentation**: Interactive Swagger documentation is automatically generated by Django Ninja and accessible at `/api/docs`.
- **Security Hardening (Django Settings)**:
  - Strict host enforcement: `ALLOWED_HOSTS = ['api.ravell.tech', 'localhost', '127.0.0.1']`
  - Explicit debug control: `DEBUG` defaults strictly to `False` in production unless explicitly set to `True` via environments.
  - HTTPS Enforcements: `SECURE_SSL_REDIRECT = True` forcing SSL connections, `SECURE_HSTS_SECONDS = 31536000` (1 year HSTS policy), and cookie security flags (`SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`).
  - CORS configurations limiting access only to trusted domains (`https://ravell.tech`, local environments).

---

## 🗄️ Database & Storage Integration

### 1. PostgreSQL (Supabase DB)
The backend utilizes PostgreSQL hosted on Supabase as its primary data store.
- **Connection Pooling**: Django connects via Supabase Connection Pooler on port `6543` using transaction-based pooling for optimized concurrent connections.
- **Configuration**: Uses `dj-database-url` to parse connection strings dynamically from system environment parameters:
  ```env
  DATABASE_URL=postgresql://<user>:<password>@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
  ```

### 2. S3 Object Storage (Supabase Storage)
All article media (images, diagrams, downloads) are hosted on Supabase Storage using its S3-compatible API.
- **Libraries**: `django-storages` and `boto3` manage secure assets uploading.
- **Setup Parameters**:
  - `AWS_STORAGE_BUCKET_NAME = 'media'`
  - `AWS_S3_ENDPOINT_URL = 'https://<ref>.storage.supabase.co/storage/v1/s3'`
  - Overwriting files is disabled (`AWS_S3_FILE_OVERWRITE = False`) to prevent naming conflicts.
  - Custom domains are dynamically reconstructed in `settings.py` for serving media over public links.

---

## 🛡️ Cloudflare & Network Security Setup

Cloudflare acts as the edge security proxy, caching static assets, reducing latency, and mitigating attacks.

### 📋 Recommended Security Baseline Configuration
To keep the site secure, fast, and free of mixed content issues, ensure these settings are active in the Cloudflare Dashboard:

| Section | Setting | Value / State | Purpose |
|---------|---------|---------------|---------|
| **SSL/TLS -> Overview** | Encryption Mode | **Full (Strict)** | Forces end-to-end TLS encryption from Client -> Cloudflare -> Server. |
| **SSL/TLS -> Edge Certs** | Always Use HTTPS | **ON** | Redirects all unencrypted HTTP requests to HTTPS. |
| **SSL/TLS -> Edge Certs** | Minimum TLS Version | **TLS 1.2** | Disables outdated and vulnerable TLS 1.0/1.1 protocols. |
| **SSL/TLS -> Edge Certs** | Opportunistic Onion | **ON** | Routes onion routing-compatible traffic securely. |
| **Rules -> Page Rules** | `/api/*` Managed Challenge | **Disabled / Custom WAF** | Bypasses managed challenges for API endpoints to prevent blocking frontend calls. |
| **Speed -> Optimization** | Brotli & Early Hints | **ON** | Enhances resource compression and caching performance. |
| **Scrape Shield** | Email Obfuscation | **ON** | Scrambles plaintext email addresses to prevent scraper bot harvesting. |
| **Scrape Shield** | Hotlink Protection | **ON** | Prevents external websites from embedding your hosted media files directly. |

---

## 🖥️ Deployment & Server Configurations

### 1. Server Specification
- **Provider**: Tencent Cloud Lighthouse
- **Operating System**: Ubuntu 24.04 LTS
- **Server IP**: `43.163.111.6`
- **DNS Record**: `api.ravell.tech` (pointing to the Server IP)

### 2. Port & Firewall Settings (Tencent Cloud Security Group)
- **Port 22 (TCP)**: SSH (Restrict to trusted management IPs)
- **Port 80 (TCP)**: HTTP (Allowed for Let's Encrypt challenges and SSL redirects)
- **Port 443 (TCP)**: HTTPS (Allowed for encrypted client requests)

### 3. Gunicorn Systemd Service File
Located at `/etc/systemd/system/ravell-backend.service`:
```ini
[Unit]
Description=Ravell Tech Django Backend (Gunicorn)
After=network.target

[Service]
User=ubuntu
Group=ubuntu
WorkingDirectory=/var/www/ravell-backend
EnvironmentFile=/var/www/ravell-backend/.env
ExecStart=/var/www/ravell-backend/venv/bin/gunicorn \
    --workers 3 \
    --bind 127.0.0.1:8000 \
    --access-logfile /var/log/ravell-backend/access.log \
    --error-logfile /var/log/ravell-backend/error.log \
    myitblog_backend.wsgi:application
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### 4. Nginx Server Block (Sites-Enabled)
Located at `/etc/nginx/sites-available/ravell-backend`:
```nginx
server {
    server_name api.ravell.tech 43.163.111.6;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Static Files serving directly from disk
    location /static/ {
        alias /var/www/ravell-backend/staticfiles/;
        expires 30d;
        add_header Cache-Control public;
    }

    # API Proxy to Gunicorn
    location / {
        include proxy_params;
        proxy_pass http://127.0.0.1:8000;
        proxy_read_timeout 120;
        proxy_connect_timeout 120;
        client_max_body_size 20M;
    }

    listen 443 ssl; # Managed by Certbot Let's Encrypt
    ssl_certificate /etc/letsencrypt/live/api.ravell.tech/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.ravell.tech/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    if ($host = api.ravell.tech) {
        return 301 https://$host$request_uri;
    }
    listen 80;
    server_name api.ravell.tech;
    return 404;
}
```

## 🛠️ Dual-Environment Workflow (Production & Development)

The platform is configured with two distinct running environments: **Production** and **Development**.

| Config / Parameter | Production Environment (Main) | Development Environment (Dev) |
|---|---|---|
| **Git Branch** | `main` | `development` |
| **Frontend URL** | `https://ravell.tech` | `https://dev.ravell.tech` |
| **Backend API URL** | `https://api.ravell.tech` | `https://api-dev.ravell.tech` |
| **VPS Directory** | `/var/www/ravell-backend` | `/var/www/ravell-backend-dev` |
| **Systemd Service** | `ravell-backend.service` | `ravell-backend-dev.service` |
| **Port (Local Gunicorn)** | `8000` | `8001` |
| **Database Integration** | Supabase (Shared) | Supabase (Shared) |

> [!WARNING]
> **Shared Database Architecture**: Both environments currently share the same Supabase database. This guarantees identical article, category, and tag content on both sites, but means any edits, additions, or deletions made in the Development Admin Panel (`https://api-dev.ravell.tech/ravell-manage/`) will immediately impact the Production website.

### Git Branching Workflow
1. All new features, style adjustments, or bug fixes must be committed to the `development` branch first.
2. Verify the changes on the development frontend (`https://dev.ravell.tech`) and backend (`https://api-dev.ravell.tech`).
3. Once fully verified, create a Pull Request to merge `development` into `main`, resolve any conflicts, and deploy to production.

---

## 🚀 Local Setup & Deployment Guides

### 1. Frontend Local Development
1. Clone the repository and navigate to the directory:
   ```bash
   git clone https://github.com/rifandii/Ravell_FrontEnd.git
   cd Ravell_FrontEnd
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set environment variable in `.env.local`:
   ```env
   VITE_API_BASE_URL=https://api.ravell.tech
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### 2. Backend Local Development
1. Clone the repository and navigate to the directory:
   ```bash
   git clone https://github.com/rifandii/Ravell_BackEnd.git
   cd Ravell_BackEnd
   ```
2. Create and activate virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Convert dependency file format (if using UTF-16 requirements from Windows):
   ```bash
   iconv -f UTF-16 -t UTF-8 requirements.txt > requirements_utf8.txt
   pip install -r requirements_utf8.txt
   ```
4. Configure `.env` file in the root workspace (DATABASE_URL, SECRET_KEY, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY).
5. Apply migrations and collect static files:
   ```bash
   python manage.py migrate
   python manage.py collectstatic
   ```
6. Start the local server:
   ```bash
   python manage.py runserver
   ```

### 3. Production Redeployment (Cheat Sheet)
When codes are pushed to GitHub `main` branch, log in to the Tencent Cloud server and run:
```bash
ssh ravell-tech
cd /var/www/ravell-backend
source venv/bin/activate
git pull origin main

# Convert dependency file & install changes
iconv -f UTF-16 -t UTF-8 requirements.txt > requirements_utf8.txt
pip install -r requirements_utf8.txt -q

# Run database migrations
set -a && source .env && set +a
python manage.py migrate
python manage.py collectstatic --noinput

# Restart backend process
sudo systemctl restart ravell-backend
```

### 4. Development Redeployment (Cheat Sheet)
When codes are pushed to GitHub `development` branch, log in to the Tencent Cloud server and run:
```bash
ssh ravell-tech
cd /var/www/ravell-backend-dev
source venv/bin/activate
git pull origin development

# Convert dependency file & install changes
iconv -f UTF-16 -t UTF-8 requirements.txt > requirements_utf8.txt
pip install -r requirements_utf8.txt -q

# Run database migrations (optional, since it shares the same database as production)
set -a && source .env && set +a
python manage.py migrate
python manage.py collectstatic --noinput

# Restart backend dev process
sudo systemctl restart ravell-backend-dev
```

---
*📁 Integrated README generated on June 20, 2026 for the Ravell Networks tech stack.*