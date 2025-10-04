# SquadLink Frontend Setup Guide

## ✅ Backend is Ready with:
- MongoDB Connection
- User Management (Register/Login)
- Google OAuth configured
- JWT Authentication
- Running on Port 3000

## 🎨 Frontend Theme - Purple Void Gaming

### Color Palette
- **Primary**: #8B5CF6 (Vibrant Purple)
- **Secondary**: #6366F1 (Indigo)
- **Accent**: #EC4899 (Pink)
- **Background Dark**: #0A0118 (Deep void)
- **Background Light**: #F8F7FF (Soft purple tint)

---

## 📦 Required Packages (Already Installed)
```bash
npm install next-auth next-themes axios react-icons
```

---

## 🗂️ File Structure Created

```
frontend/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts (NextAuth configuration)
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx (Login screen - TO CREATE)
│   │   └── register/
│   │       └── page.tsx (Register screen - TO CREATE)
│   ├── config/
│   │   ├── theme.ts (Color definitions)
│   │   └── constants.ts (API URLs, routes)
│   ├── providers.tsx (Theme + Session providers)
│   ├── styles.css (Complete gaming theme CSS)
│   ├── welcome.tsx (Welcome page component)
│   └── layout.tsx (Root layout with providers)
├── assets/
│   └── logo.png (Your app logo - UPLOAD THIS)
└── .env.local (Environment variables)
```

---

## 🚀 Next Steps to Complete

### 1. Upload Logo
Place your logo at: `frontend/assets/logo.png`

### 2. Create Login Page
File: `frontend/app/auth/login/page.tsx`

Features:
- Email/Password form
- Google OAuth button
- Link to register
- Gaming-themed with logo

### 3. Create Register Page
File: `frontend/app/auth/register/page.tsx`

Features:
- First Name, Last Name
- Email, Password
- Age input
- Google OAuth option
- Link to login

### 4. Update Environment Variables
File: `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
GOOGLE_CLIENT_ID=102051266377-7kb1q31opfv6aaoooes397vgtj8juktq.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-secret-here
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=generate-a-random-secret-here
```

### 5. Google Cloud Console Settings

**Authorized JavaScript Origins:**
```
http://localhost:3001
```

**Authorized Redirect URIs:**
```
http://localhost:3001/api/auth/callback/google
```

---

## 🎨 Design System

### Components to Use

**Buttons:**
```tsx
// Primary CTA
<button className="btn-hover px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold glow-effect">
  Button Text
</button>

// Secondary
<button className="glass border-2 border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white">
  Button Text
</button>
```

**Inputs:**
```tsx
<input 
  className="w-full px-4 py-3 rounded-lg glass border border-purple-500/30 focus:border-purple-500"
  type="email"
/>
```

**Cards:**
```tsx
<div className="glass p-8 rounded-2xl">
  Content
</div>
```

### CSS Classes Available
- `glass` - Glassmorphism effect
- `glow-effect` - Purple glow shadow
- `glow-text` - Glowing text effect
- `floating` - Floating animation
- `btn-hover` - Button hover effect
- `gradient-primary` - Purple to indigo gradient
- `gradient-secondary` - Pink to purple gradient

---

## 🔧 API Integration

### Register User
```typescript
const response = await fetch('http://localhost:3000/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName,
    lastName,
    email,
    password,
    age
  })
});
```

### Login User
```typescript
import { signIn } from 'next-auth/react';

await signIn('credentials', {
  email,
  password,
  callbackUrl: '/home'
});
```

### Google Sign In
```typescript
import { signIn } from 'next-auth/react';

await signIn('google', {
  callbackUrl: '/home'
});
```

---

## 📱 PWA Configuration

Create `frontend/public/manifest.json`:
```json
{
  "name": "SquadLink",
  "short_name": "SquadLink",
  "description": "Link Your Squad. Dominate Together.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0A0118",
  "theme_color": "#A78BFA",
  "icons": [
    {
      "src": "/assets/logo.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🏃 Running the App

### 1. Start MongoDB
```bash
brew services start mongodb-community
```

### 2. Start Backend (Port 3000)
```bash
cd backend
npm run start:dev
```

### 3. Start Frontend (Port 3001)
```bash
cd frontend
npm run dev
```

### 4. Open Browser
```
http://localhost:3001
```

---

## ✨ Features Implemented

- ✅ Purple Void Gaming Theme
- ✅ Dark/Light Mode Toggle
- ✅ Theme Persistence (localStorage)
- ✅ NextAuth.js Setup
- ✅ Google OAuth Ready
- ✅ Animated Backgrounds
- ✅ Glow Effects
- ✅ Glassmorphism UI
- ✅ Responsive Design
- ✅ Welcome Screen with Logo

---

## 🎯 Still To Do

1. Create Login Page Component
2. Create Register Page Component
3. Add Logo Image
4. Get Google Client Secret
5. Generate NextAuth Secret
6. Test Authentication Flow
7. Create Home Page (after login)

---

## 🔐 Security Notes

- Change `JWT_SECRET` in backend `.env`
- Change `NEXTAUTH_SECRET` in frontend `.env.local`
- Never commit `.env` files
- Use environment variables for production

---

Would you like me to create the Login and Register pages next?
