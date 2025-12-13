# 🍬 Sweet Shop Management System

A full-stack web application for managing a sweet shop inventory with role-based access control, built following Test-Driven Development (TDD) principles.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Running Tests](#running-tests)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [AI Usage Disclosure](#ai-usage-disclosure)
- [License](#license)

## ✨ Features

### Authentication & Authorization
- **JWT-based authentication** with secure token management
- **Role-based access control** (Admin and User roles)
- User registration and login with password hashing
- Protected routes requiring authentication

### Sweet Management (Admin Only)
- Create new sweets with name, category, price, quantity, and description
- Update existing sweet details
- Delete sweets from inventory
- Restock sweets with quantity tracking
- View all transactions

### Customer Features
- Browse available sweets
- Search sweets by name
- Filter sweets by category and availability
- Purchase sweets (with automatic stock updates)
- View detailed sweet information

### Real-time Features
- Live inventory updates
- Transaction history
- Category-based filtering
- Search functionality

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TanStack Query (React Query)** - Server state management
- **Wouter** - Lightweight routing
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend
- **Node.js 20** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL (Neon)** - Database
- **Drizzle ORM** - Database ORM
- **JSON Web Tokens (JWT)** - Authentication
- **bcrypt (scrypt)** - Password hashing

### Testing
- **Vitest** - Test framework
- **Supertest** - API testing
- **React Testing Library** - Component testing
- **@testing-library/jest-dom** - DOM matchers

### DevOps & Tools
- **Git** - Version control
- **ESLint** - Code linting
- **cross-env** - Cross-platform environment variables
- **tsx** - TypeScript execution

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20 or higher)
- **npm** (v9 or higher)
- **PostgreSQL** database (or Neon account)
- **Git**

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd TDD-Kata-Sweetshop
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:5432/database

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
SESSION_SECRET=your-session-secret-key

# Node Environment
NODE_ENV=development
```

**Important:** Replace the placeholder values with your actual credentials.

### 4. Database Setup

Push the database schema to your PostgreSQL database:

```bash
npm run db:push
```

### 5. Seed Database (Optional)

Populate the database with sample data including an admin user:

```bash
npm run db:seed
```

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

**Default Test User:**
- Username: `testuser`
- Password: `password123`

## 🏃 Running the Application

### Development Mode

Start the development server with hot reload:

```bash
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5000`
- Backend API: `http://localhost:5000/api`

### Production Mode

Build and start the production server:

```bash
npm run build
npm start
```

## 🧪 Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm test
```

### Run Tests with UI

```bash
npm run test:ui
```

### Generate Coverage Report

```bash
npm run test:coverage
```

Coverage report will be generated in the `coverage/` directory. Open `coverage/index.html` in a browser to view detailed coverage.

### Test Results

```
✅ 57 tests passing
⏭️ 5 tests skipped
📊 Test Files: 4 passed

- server/jwt.test.ts: 12/12 ✅
- server/auth.test.ts: 17/17 ✅
- server/routes.test.ts: 22/25 ✅
- client/src/hooks/use-auth.test.tsx: 6/8 ✅
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "password": "string",
  "role": "user" | "admin" (optional, defaults to "user")
}

Response: 201 Created
{
  "user": {
    "id": number,
    "username": "string",
    "role": "user" | "admin"
  },
  "token": "jwt-token"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}

Response: 200 OK
{
  "user": {
    "id": number,
    "username": "string",
    "role": "user" | "admin"
  },
  "token": "jwt-token"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Logged out successfully"
}
```

#### Get Current User
```http
GET /api/user
Authorization: Bearer <token>

Response: 200 OK
{
  "id": number,
  "username": "string",
  "role": "user" | "admin"
}
```

### Sweet Management Endpoints

#### Get All Sweets
```http
GET /api/sweets
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": number,
    "name": "string",
    "category": "string",
    "price": "decimal",
    "quantity": number,
    "description": "string",
    "imageUrl": "string"
  }
]
```

#### Search Sweets
```http
GET /api/sweets/search?name=candy&category=Chocolate&inStock=true
Authorization: Bearer <token>

Query Parameters:
- name: string (optional)
- category: string (optional)
- inStock: boolean (optional)
```

#### Get Categories
```http
GET /api/sweets/categories
Authorization: Bearer <token>

Response: 200 OK
["Candy", "Chocolate", "Gummies", "Pastry"]
```

#### Create Sweet (Admin Only)
```http
POST /api/sweets
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string",
  "category": "string",
  "price": "string",
  "quantity": number,
  "description": "string" (optional),
  "imageUrl": "string" (optional)
}

Response: 201 Created
```

#### Update Sweet (Admin Only)
```http
PATCH /api/sweets/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string" (optional),
  "category": "string" (optional),
  "price": "string" (optional),
  "quantity": number (optional),
  "description": "string" (optional),
  "imageUrl": "string" (optional)
}

Response: 200 OK
```

#### Delete Sweet (Admin Only)
```http
DELETE /api/sweets/:id
Authorization: Bearer <token>

Response: 204 No Content
```

### Transaction Endpoints

#### Purchase Sweet
```http
POST /api/sweets/:id/purchase
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": number
}

Response: 201 Created
{
  "id": number,
  "userId": number,
  "sweetId": number,
  "quantity": number,
  "totalPrice": "decimal",
  "type": "purchase",
  "createdAt": "timestamp"
}
```

#### Restock Sweet (Admin Only)
```http
POST /api/sweets/:id/restock
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": number
}

Response: 200 OK
```

#### Get All Transactions (Admin Only)
```http
GET /api/transactions
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": number,
    "userId": number,
    "sweetId": number,
    "quantity": number,
    "totalPrice": "decimal",
    "type": "purchase" | "restock",
    "createdAt": "timestamp"
  }
]
```

### Error Responses

```http
400 Bad Request - Invalid input data
401 Unauthorized - Missing or invalid authentication token
403 Forbidden - Insufficient permissions
404 Not Found - Resource not found
500 Internal Server Error - Server error
```

## 🗄 Database Schema

### Users Table
```sql
users {
  id: serial PRIMARY KEY
  username: varchar(255) UNIQUE NOT NULL
  password: varchar(255) NOT NULL
  role: varchar(50) NOT NULL DEFAULT 'user'
}
```

### Sweets Table
```sql
sweets {
  id: serial PRIMARY KEY
  name: varchar(255) NOT NULL
  category: varchar(100) NOT NULL
  price: numeric(10,2) NOT NULL
  quantity: integer NOT NULL DEFAULT 0
  description: text
  imageUrl: text
}
```

### Transactions Table
```sql
transactions {
  id: serial PRIMARY KEY
  userId: integer REFERENCES users(id)
  sweetId: integer REFERENCES sweets(id)
  quantity: integer NOT NULL
  totalPrice: numeric(10,2) NOT NULL
  type: varchar(50) NOT NULL
  createdAt: timestamp DEFAULT CURRENT_TIMESTAMP
}
```

### Relationships
- `transactions.userId` → `users.id` (Many-to-One)
- `transactions.sweetId` → `sweets.id` (Many-to-One)

## 📁 Project Structure

```
TDD-Kata-Sweetshop/
├── client/                  # Frontend React application
│   ├── public/             # Static assets
│   └── src/
│       ├── components/     # React components
│       │   ├── ui/        # shadcn/ui components
│       │   ├── header.tsx
│       │   ├── sweet-card.tsx
│       │   └── ...
│       ├── hooks/         # Custom React hooks
│       │   ├── use-auth.tsx
│       │   └── use-toast.ts
│       ├── lib/           # Utility functions
│       │   ├── queryClient.ts
│       │   └── utils.ts
│       ├── pages/         # Page components
│       │   ├── home-page.tsx
│       │   ├── admin-page.tsx
│       │   └── auth-page.tsx
│       ├── App.tsx        # Root component
│       └── main.tsx       # Entry point
├── server/                # Backend Express application
│   ├── auth.ts           # Authentication logic
│   ├── auth.test.ts      # Auth tests
│   ├── db.ts             # Database connection
│   ├── index.ts          # Server entry point
│   ├── jwt.ts            # JWT utilities
│   ├── jwt.test.ts       # JWT tests
│   ├── routes.ts         # API routes
│   ├── routes.test.ts    # Route tests
│   ├── storage.ts        # Database operations
│   └── vite.ts           # Vite integration
├── shared/               # Shared TypeScript types
│   └── schema.ts         # Database schema & types
├── test/                 # Test configuration
│   └── setup.ts          # Test setup file
├── seed.ts               # Database seeding script
├── vitest.config.ts      # Vitest configuration
├── .env                  # Environment variables
└── package.json          # Dependencies & scripts
```

## 🤖 AI Usage Disclosure

This project was developed with significant assistance from **GitHub Copilot** (Claude Sonnet 4.5 model) as an AI pair programming tool. This disclosure is made in accordance with TDD Kata requirements for transparency.

### AI Assistance Level: **High (80-90%)**

### Areas Where AI Provided Assistance:

#### 1. **Project Architecture & Setup** (90%)
- Initial project structure and file organization
- Build configuration (Vite, TypeScript, Tailwind)
- Package selection and dependency management
- Environment setup for Windows development

#### 2. **Backend Development** (85%)
- Express server setup with TypeScript
- Database schema design using Drizzle ORM
- JWT authentication implementation
- RESTful API endpoint design
- Password hashing with scrypt
- Middleware creation (auth, admin)
- Error handling patterns

#### 3. **Frontend Development** (80%)
- React component structure
- shadcn/ui component integration
- TanStack Query setup for state management
- Custom hooks (useAuth, useToast)
- Form handling and validation
- Routing with Wouter
- Responsive UI design

#### 4. **Testing Infrastructure** (95%)
- Vitest configuration
- Test file structure
- API testing with Supertest
- Component testing setup
- Mock implementations
- Test data generation
- Coverage configuration

#### 5. **Test Writing** (90%)
- Authentication test cases
- JWT token validation tests
- API endpoint tests
- Role-based access control tests
- Purchase/restock transaction tests
- Component rendering tests

#### 6. **Debugging & Problem Solving** (85%)
- Windows environment variable issues
- Database connection troubleshooting
- JWT token extraction logic
- Test failure resolution
- CORS configuration
- localStorage key consistency

#### 7. **Documentation** (100%)
- This README file
- Code comments
- API documentation
- Setup instructions

### Human Contributions:

1. **Requirements Definition**: Specified the sweet shop domain and business rules
2. **Decision Making**: Made architectural choices and approved AI suggestions
3. **Testing & Validation**: Tested the application manually and verified functionality
4. **Configuration**: Provided database credentials and environment setup
5. **Code Review**: Reviewed AI-generated code and requested modifications
6. **Direction**: Guided the implementation order and priorities

### Development Workflow:

The project was built using an **AI-assisted TDD approach**:

1. Human defined feature requirements
2. AI generated test cases
3. AI implemented code to pass tests
4. Human verified functionality
5. AI refactored based on feedback
6. Repeat for each feature

### Methodology:

- **Prompt Engineering**: Clear, specific instructions were provided to the AI
- **Iterative Development**: Features were built incrementally with frequent testing
- **Test-First Approach**: Tests were written before implementation code
- **Code Review**: All AI-generated code was reviewed and sometimes modified

### AI Limitations Encountered:

1. Required multiple attempts to fix test failures related to async operations
2. Needed guidance on Windows-specific path handling
3. Required clarification on database schema relationships
4. Occasional need to correct test assertions

### Why This Transparency Matters:

Understanding AI's role in development is important for:
- **Learning**: Knowing how AI can accelerate development
- **Evaluation**: Properly assessing the developer's skills and AI's capabilities
- **Trust**: Being honest about the development process
- **Future Reference**: Understanding what worked and what didn't

### Skills Demonstrated (Human):

Even with AI assistance, this project demonstrates:
- Understanding of full-stack web development concepts
- Ability to work with modern JavaScript/TypeScript tools
- Knowledge of RESTful API design
- Understanding of authentication and security
- Database design and ORM usage
- Testing methodologies and TDD principles
- Problem-solving and debugging skills
- Project management and task prioritization

## 📄 License

MIT License - Feel free to use this project for learning purposes.

---

**Note**: This is a learning project created as part of a TDD Kata exercise. It demonstrates Test-Driven Development principles with comprehensive test coverage and clean architecture.

## 🔗 Quick Links

- [GitHub Repository](https://github.com/yourusername/TDD-Kata-Sweetshop)
- [Live Demo](https://your-deployment-url.com)
- [Test Coverage Report](./coverage/index.html)

---

**Built with ❤️ using Test-Driven Development**
