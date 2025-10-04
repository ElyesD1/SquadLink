# Google OAuth Configuration Guide ✅

## ✅ FIXED - Current Setup

### Ports Configuration
- **Frontend (Next.js)**: `http://localhost:3000` ✅
- **Backend (NestJS)**: `http://localhost:3001` ✅
- **Database**: MongoDB on `mongodb://localhost:27017/squadlink`

### ✅ Correct Google OAuth Redirect URI
```
http://localhost:3000/api/auth/callback/google
```

---

## 🔧 Google Cloud Console Setup

### 1. Authorized JavaScript Origins
Add the following origins for local development:

```
http://localhost:3000
```

### 2. Authorized Redirect URIs ⚠️ CRITICAL
Add **ONLY** this redirect URI:

```
http://localhost:3000/api/auth/callback/google
```

**Remove any old/incorrect URIs like:**
- ❌ `http://localhost:3000/auth/google/callback`
- ❌ `http://localhost:3001/api/auth/callback/google`

---

## Configuration Details

### Your Google Client ID
```
102051266377-7kb1q31opfv6aaoooes397vgtj8juktq.apps.googleusercontent.com
```

### Environment Variables (Backend)

Located in `/backend/.env`:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/squadlink

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

---

## MongoDB Setup

### 1. Make sure MongoDB is running:
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or run directly
mongod --config /usr/local/etc/mongod.conf
```

### 2. Connect with MongoDB Compass
- **Connection String**: `mongodb://localhost:27017`
- **Database Name**: `squadlink`

### 3. Verify Connection
Open MongoDB Compass and connect to `mongodb://localhost:27017`. You should see the `squadlink` database created automatically when you start using the app.

---

## Running the Application

### 1. Start MongoDB
```bash
brew services start mongodb-community
```

### 2. Start Backend (Port 3001)
```bash
cd backend
npm run start:dev
```

### 3. Start Frontend (Port 3000)
```bash
cd frontend
npm run dev
```

---

## API Endpoints

### Authentication Endpoints

#### Register
```
POST http://localhost:3001/auth/register
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
POST http://localhost:3001/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Google OAuth (Redirect)
```
GET http://localhost:3001/auth/google
```

### Protected Endpoints (Require JWT)

#### Get Profile
```
GET http://localhost:3001/users/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get All Users
```
GET http://localhost:3001/users
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Next Steps

1. **Get Google Client Secret**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to your OAuth 2.0 Client
   - Copy the Client Secret
   - Update `GOOGLE_CLIENT_SECRET` in `.env`

2. **Start MongoDB**:
   - Ensure MongoDB is installed and running
   - Use MongoDB Compass to connect and verify

3. **Test the Backend**:
   ```bash
   cd backend
   npm run start:dev
   ```

4. **Set up Frontend** (Next steps):
   - Install NextAuth.js or use the backend OAuth flow
   - Configure Google provider with your credentials
   - Build login/register pages

---

## Troubleshooting

### MongoDB Connection Error
```
MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running with `brew services start mongodb-community`

### Google OAuth Error
```
Error 400: redirect_uri_mismatch
```
**Solution**: Make sure the redirect URI in Google Cloud Console exactly matches the one in your `.env` file

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3001
```
**Solution**: Kill the process using the port:
```bash
lsof -ti:3001 | xargs kill -9
```
