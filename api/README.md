# Celebration Diamond API

A RESTful API server for the Celebration Diamond jewelry website, built with **TypeScript**, Express.js and Prisma.

## Features

- 🔐 JWT Authentication
- 🎯 Banner Management
- 📦 Product Management (coming soon)
- 🛡️ Security middleware (Helmet, CORS, Rate limiting)
- 📊 Request logging
- 🗄️ PostgreSQL database with Prisma ORM
- ✅ Input validation
- 🚨 Error handling
- 🔷 **Full TypeScript support**
- 🎯 **Type-safe API endpoints**
- 📝 **Comprehensive type definitions**

## Quick Start

### Prerequisites

- Node.js (>= 18.0.0)
- PostgreSQL database
- npm or yarn
- TypeScript knowledge (optional but recommended)

### Installation

1. **Install dependencies:**
   ```bash
   cd api
   npm install
   ```

2. **Environment Setup:**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your database credentials and other configuration.

3. **Database Setup:**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Or run migrations
   npm run db:migrate
   ```

4. **Build TypeScript:**
   ```bash
   # Build TypeScript to JavaScript
   npm run build
   ```

5. **Start the server:**
   ```bash
   # Development (with hot reload)
   npm run dev
   
   # Development (with watch mode)
   npm run dev:watch
   
   # Production (requires build first)
   npm start
   ```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Admin registration
- `GET /api/auth/me` - Get current admin profile

### Banners
- `GET /api/banners` - Get all active banners (public)
- `GET /api/banners/:id` - Get banner by ID (public)
- `GET /api/banners/admin/all` - Get all banners (admin)
- `POST /api/banners` - Create banner (admin)
- `PUT /api/banners/:id` - Update banner (admin)
- `DELETE /api/banners/:id` - Delete banner (admin)
- `PATCH /api/banners/:id/toggle` - Toggle banner status (admin)

### Health Check
- `GET /health` - Server health status

## Banner API Usage

### Create Banner
```bash
curl -X POST http://localhost:3001/api/banners \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Summer Sale",
    "text": "Get 50% off on all jewelry!",
    "linkText": "Shop Now",
    "linkUrl": "https://example.com/sale",
    "backgroundColor": "#ff6b6b",
    "textColor": "#ffffff",
    "priority": 1,
    "isActive": true
  }'
```

### Get Active Banners
```bash
curl http://localhost:3001/api/banners
```

### Update Banner
```bash
curl -X PUT http://localhost:3001/api/banners/BANNER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Updated Title",
    "text": "Updated banner text"
  }'
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment | development |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d |
| `CORS_ORIGIN` | Allowed CORS origins | http://localhost:3000 |

## Database Schema

### Banner Model
```prisma
model Banner {
  id              String    @id @default(cuid())
  title           String
  description     String?
  text            String
  linkText        String?
  linkUrl         String?
  backgroundColor String?   @default("#ffffff")
  textColor       String?   @default("#000000")
  isActive        Boolean   @default(true)
  priority        Int       @default(0)
  startDate       DateTime?
  endDate         DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

### Project Structure
```
api/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   └── bannerController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── notFound.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bannerRoutes.js
│   │   └── productRoutes.js
│   └── server.js
├── prisma/
│   └── schema.prisma
├── package.json
└── README.md
```

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- SQL injection protection (Prisma)

## License

MIT

