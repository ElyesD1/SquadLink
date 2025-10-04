# SquadLink Backend API

## Features

- **User Registration & Login** with email/password
- **Google OAuth 2.0** authentication
- **JWT** token-based authentication
- **PostgreSQL** database with TypeORM
- **Password hashing** with bcrypt
- **Input validation** with class-validator

## API Endpoints

### Authentication

#### Register
```
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "age": 25
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Google OAuth
```
GET /auth/google
```
Redirects to Google for authentication

```
GET /auth/google/callback
```
Google callback URL (handled automatically)

### Users (Protected Routes - Require JWT Token)

#### Get Current User Profile
```
GET /users/profile
Authorization: Bearer <your-jwt-token>
```

#### Get All Users
```
GET /users
Authorization: Bearer <your-jwt-token>
```

## Setup Instructions

### 1. Install PostgreSQL

Make sure PostgreSQL is installed and running on your system.

### 2. Create Database

```bash
createdb squadlink
```

Or using psql:
```sql
CREATE DATABASE squadlink;
```

### 3. Configure Environment Variables

Update the `.env` file with your credentials:

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your-postgres-password
DATABASE_NAME=squadlink

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=7d

# Google OAuth
GOOGLE_CLIENT_ID=102051266377-7kb1q31opfv6aaoooes397vgtj8juktq.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# Application
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### 4. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth Client ID
5. Configure OAuth consent screen
6. Add these URIs:
   - **Authorized JavaScript origins**: `http://localhost:3001`
   - **Authorized redirect URIs**: `http://localhost:3001/auth/google/callback`
7. Copy the Client Secret and update `.env`

### 5. Install Dependencies

```bash
npm install
```

### 6. Run the Application

Development mode:
```bash
npm run start:dev
```

Production mode:
```bash
npm run build
npm run start:prod
```

The API will be running on `http://localhost:3001`

## User Model

```typescript
{
  id: string (UUID)
  firstName: string
  lastName: string
  email: string (unique)
  password: string (hashed, nullable for Google users)
  age: number
  googleId: string (nullable)
  profilePicture: string (nullable)
  provider: string ('local' | 'google')
  createdAt: Date
  updatedAt: Date
}
```

## Testing with cURL

### Register a new user:
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "age": 25
  }'
```

### Login:
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get profile (use token from login response):
```bash
curl http://localhost:3001/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Tech Stack

- **NestJS** - Progressive Node.js framework
- **TypeORM** - ORM for TypeScript
- **PostgreSQL** - Database
- **Passport** - Authentication middleware
- **JWT** - Token-based authentication
- **bcrypt** - Password hashing
- **class-validator** - DTO validation

## Project setup


```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
