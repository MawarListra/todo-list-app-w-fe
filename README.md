# TODO List API 📋

A robust, production-ready RESTful API for managing TODO lists built with Express.js, TypeScript,
and comprehensive Swagger documentation.

![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-16+-green?logo=node.js)
![Express.js](https://img.shields.io/badge/Express.js-4.18+-lightgrey?logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue?logo=postgresql)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI_3.0-green?logo=swagger)

## 🌟 Features

- **🔥 Complete CRUD Operations** for lists and tasks
- **📚 Interactive API Documentation** with Swagger UI
- **🛡️ TypeScript** for type safety and better development experience
- **🏗️ Dual Repository Support** - Memory & SQL with factory pattern
- **🗄️ Database Migration System** with version control and rollback
- **✅ Comprehensive Validation** with Joi schemas and custom middleware
- **🔍 Advanced Query Capabilities** (filtering, sorting, pagination)
- **❤️ Health Check Endpoints** for monitoring and uptime
- **⚡ Production-Ready Build** with Vite and optimized bundling
- **🔒 Security Features** - Rate limiting, CORS, input sanitization
- **📊 Error Handling** - Custom exceptions and structured responses

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16.0 or higher
- **npm** or **yarn**
- **PostgreSQL** (optional - defaults to memory storage)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/todo-list-api.git
cd todo-list-api

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Build the application
npm run build

# Start the server
npm start
```

### Development Mode

```bash
# Start development server with hot reload
npm run dev

# Alternative: Run with TypeScript directly
npm run start:dev

# Watch mode for continuous building
npm run build:watch
```

## 📚 API Documentation

Once the server is running, access the **interactive Swagger documentation**:

### 🔗 **http://localhost:3001/docs**

![Swagger UI Preview](https://via.placeholder.com/800x400/1f2937/ffffff?text=Interactive+API+Documentation)

### Core Endpoints

#### 📝 Lists Management

```http
GET    /api/lists              # Get all lists with optional filtering
POST   /api/lists              # Create a new list
PUT    /api/lists/{id}          # Update an existing list
DELETE /api/lists/{id}          # Delete a list and its tasks
GET    /api/lists/{id}/tasks    # Get all tasks in a specific list
```

#### ✅ Tasks Management

```http
POST   /api/lists/{listId}/tasks    # Create a new task in a list
GET    /api/tasks/{id}              # Get a specific task by ID
PUT    /api/tasks/{id}              # Update task details
DELETE /api/tasks/{id}              # Delete a task
PATCH  /api/tasks/{id}/completion   # Toggle task completion status
PATCH  /api/tasks/{id}/deadline     # Update task deadline
```

#### 🔍 Advanced Queries

```http
GET /api/tasks/due-this-week                    # Tasks due within 7 days
GET /api/tasks?sortBy=deadline&order=asc        # Sort tasks by deadline
GET /api/tasks?completed=true                   # Filter completed tasks
GET /api/tasks?priority=high&listId=abc123      # Complex filtering
```

#### 🏥 System Health

```http
GET /health        # Basic health check
GET /health/detail # Detailed system status
GET /api          # API information and version
```

## 🏗️ Architecture

The application follows **clean architecture principles** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│                  API Layer                          │
│     REST endpoints with Express.js + OpenAPI       │
├─────────────────────────────────────────────────────┤
│                Service Layer                        │
│    Business logic, validation, and processing      │
├─────────────────────────────────────────────────────┤
│              Repository Layer                       │
│     Data access (Memory + SQL implementations)     │
└─────────────────────────────────────────────────────┘
```

### 📁 Project Structure

```
todo-list-api/
├── 📂 src/
│   ├── 📂 controllers/        # API request handlers
│   ├── 📂 services/          # Business logic layer
│   ├── 📂 repositories/      # Data access layer
│   │   ├── 📂 interfaces/    # Repository contracts
│   │   ├── 📂 memory/        # In-memory implementation
│   │   └── 📂 sql/           # PostgreSQL implementation
│   ├── 📂 middleware/        # Express middleware
│   ├── 📂 routes/           # API route definitions
│   ├── 📂 types/            # TypeScript type definitions
│   ├── 📂 exceptions/       # Custom error classes
│   ├── 📂 docs/             # API documentation
│   ├── 📂 database/         # Database connection & utilities
│   ├── 📂 config/           # Application configuration
│   └── 📂 scripts/          # Utility scripts
├── 📂 migrations/           # Database schema migrations
├── 📂 docs/                # Project documentation
├── 📂 dist/                # Compiled JavaScript output
└── 📄 package.json         # Project dependencies
```

## 🛠️ Development

### Available Scripts

```bash
# 🔧 Development
npm run dev              # Start development server with hot reload
npm run start:dev        # Start with ts-node (alternative)

# 🏗️ Building
npm run build           # Build for production
npm run build:watch     # Build with watch mode for development

# 🗄️ Database Operations
npm run migrate         # Run pending database migrations
npm run migrate:rollback # Rollback the last migration
npm run migrate:status   # Check migration status

# 🧪 Testing
npm run test            # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report

# 🔍 Code Quality
npm run lint           # Run ESLint for code analysis
npm run lint:fix       # Auto-fix ESLint issues
npm run format         # Format code with Prettier
npm run type-check     # Run TypeScript type checking
```

### Environment Configuration

Create a `.env` file based on `.env.example`:

```env
# 🚀 Server Configuration
PORT=3001
NODE_ENV=development
API_BASE_URL=http://localhost:3001
API_VERSION=v1

# 🗄️ Database Configuration (Optional)
DATABASE_URL=postgresql://username:password@localhost:5432/todolist_db
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=todolist_db
DATABASE_USER=username
DATABASE_PASSWORD=password

# 🔒 Security Configuration
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:3000

# 📊 Application Settings
REPOSITORY_TYPE=memory              # 'memory' or 'sql'
LOG_LEVEL=info                     # 'error', 'warn', 'info', 'debug'
RATE_LIMIT_WINDOW_MS=3600000       # 1 hour in milliseconds
RATE_LIMIT_MAX_REQUESTS=1000       # Max requests per window
```

## 🗄️ Database Support

### Memory Repository (Default)

- **Perfect for development and testing**
- **No database setup required**
- **Includes realistic sample data seeding**
- **Fast and lightweight**

```typescript
// Automatically loads sample data
const lists = [
  { id: 'uuid1', name: 'Personal Tasks', description: 'My personal todo items' },
  { id: 'uuid2', name: 'Work Projects', description: 'Professional tasks and deadlines' }
];
```

### PostgreSQL Repository

- **Production-ready with full ACID compliance**
- **Complete migration system with version control**
- **Optimized queries with proper indexing**
- **Connection pooling for performance**

### Database Setup

#### Using Docker (Recommended)

```bash
# Start PostgreSQL with Docker
docker run --name todo-postgres \
  -e POSTGRES_DB=todolist_db \
  -e POSTGRES_USER=username \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:13

# Run migrations
npm run migrate
```

#### Manual Setup

```bash
# Create database
createdb todolist_db

# Update .env with your database URL
DATABASE_URL=postgresql://username:password@localhost:5432/todolist_db

# Run migrations
npm run migrate
```

### Migration Management

```bash
# 📈 Run all pending migrations
npm run migrate

# 📉 Rollback the last migration
npm run migrate:rollback

# 📊 Check migration status
npm run migrate:status

# Create new migration (manual)
# Add new file: migrations/xxx_description.sql
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run in watch mode during development
npm run test:watch

# Run specific test suites
npm test -- --testNamePattern="List Service"
npm test -- src/tests/integration/
```

### Test Coverage Goals

- **Unit Tests**: 90%+ coverage for services and utilities
- **Integration Tests**: All API endpoints
- **Error Scenarios**: Comprehensive error handling tests

## 🚀 Deployment

### Using Docker

```dockerfile
# Build the Docker image
docker build -t todo-list-api .

# Run the container
docker run -p 3001:3001 \
  -e DATABASE_URL=your_db_url \
  -e NODE_ENV=production \
  todo-list-api
```

### Using Docker Compose

```yaml
# Start the full stack
docker-compose up -d
# Includes:
# - TODO List API server
# - PostgreSQL database
# - Nginx reverse proxy (optional)
```

### Production Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set up proper logging
- [ ] Configure reverse proxy (Nginx/Apache)
- [ ] Set up SSL certificates
- [ ] Configure monitoring and alerts
- [ ] Set up automated backups
- [ ] Configure CI/CD pipeline

## 🔧 Configuration

### Repository Selection

Choose your data storage strategy:

```env
# Use in-memory storage (development)
REPOSITORY_TYPE=memory

# Use PostgreSQL (production)
REPOSITORY_TYPE=sql
DATABASE_URL=postgresql://user:pass@host:port/database
```

### API Configuration

```env
# Server settings
PORT=3001
NODE_ENV=production
API_BASE_URL=https://api.yourdomain.com

# CORS settings
CORS_ORIGIN=https://yourdomain.com,https://app.yourdomain.com

# Rate limiting
RATE_LIMIT_WINDOW_MS=3600000    # 1 hour
RATE_LIMIT_MAX_REQUESTS=1000    # 1000 requests per hour
```

## 📊 Monitoring & Health Checks

### Health Endpoints

```http
GET /health
```

```json
{
  "status": "healthy",
  "timestamp": "2025-07-03T10:30:00Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

```http
GET /health/detail
```

```json
{
  "status": "healthy",
  "timestamp": "2025-07-03T10:30:00Z",
  "uptime": 3600,
  "version": "1.0.0",
  "database": {
    "status": "connected",
    "type": "postgresql",
    "latency": "2ms"
  },
  "memory": {
    "used": "45.2MB",
    "free": "1.8GB",
    "usage": "2.4%"
  }
}
```

### Metrics Available

- **📈 Request/Response Times**
- **📊 Error Rates and Status Codes**
- **💾 Memory Usage Patterns**
- **🗄️ Database Connection Health**
- **🔢 Active Connections Count**

## 🛡️ Security Features

### Input Validation

- **Joi Schema Validation** for all request bodies
- **SQL Injection Protection** with parameterized queries
- **XSS Prevention** with input sanitization
- **Request Size Limits** to prevent abuse

### Rate Limiting

```javascript
// Default: 1000 requests per hour per IP
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000,
  message: 'Too many requests from this IP'
});
```

### Security Headers

- **Helmet.js** for security headers
- **CORS** configuration
- **Request logging** for audit trails

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with proper tests
4. **Run quality checks**: `npm run lint && npm run test`
5. **Commit your changes**: `git commit -m 'Add some amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines

- **✅ Write tests** for new features
- **📝 Update documentation** when needed
- **🎯 Follow TypeScript best practices**
- **🔍 Run linting and formatting** before commits
- **📋 Update CHANGELOG.md** for significant changes

## 📄 API Examples

### Create a New List

```bash
curl -X POST http://localhost:3001/api/lists \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Weekend Tasks",
    "description": "Things to do on the weekend",
    "color": "#3B82F6"
  }'
```

### Add a Task to a List

```bash
curl -X POST http://localhost:3001/api/lists/{listId}/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries",
    "description": "Weekly grocery shopping",
    "priority": "medium",
    "deadline": "2025-07-05T18:00:00Z"
  }'
```

### Get Tasks Due This Week

```bash
curl http://localhost:3001/api/tasks/due-this-week
```

### Complete a Task

```bash
curl -X PATCH http://localhost:3001/api/tasks/{taskId}/completion \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

## 📚 Documentation

- **📖 API Documentation**: Available at `/docs` when server is running
- **🏗️ Architecture Guide**: See `docs/ARCHITECTURE.md`
- **🗄️ Database Schema**: See `docs/DATABASE.md`
- **🚀 Deployment Guide**: See `docs/DEPLOYMENT.md`

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

Need help? Here's how to get support:

- **📖 Check the Documentation**: Start with `/docs` endpoint
- **🐛 Report Issues**: Open an issue on GitHub
- **💬 Ask Questions**: Use GitHub Discussions
- **📧 Contact**: Reach out via email for urgent matters

## 🙏 Acknowledgments

- **Express.js** for the robust web framework
- **TypeScript** for type safety and developer experience
- **Swagger/OpenAPI** for excellent API documentation
- **Vite** for fast and efficient building
- **PostgreSQL** for reliable data storage

---

**🎯 Built with ❤️ using modern Node.js practices and enterprise-grade architecture**

![Made with TypeScript](https://img.shields.io/badge/Made%20with-TypeScript-blue?style=for-the-badge&logo=typescript)
![Powered by Express](https://img.shields.io/badge/Powered%20by-Express.js-lightgrey?style=for-the-badge&logo=express)
![Database PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue?style=for-the-badge&logo=postgresql)
