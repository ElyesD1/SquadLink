# 📱 Testing PWA on Mobile - Step by Step Guide

## 🚀 Quick Start

### Option 1: Test on Production (Easiest) ⭐ Recommended

1. **Deploy your app** to Vercel/Netlify
2. **Get your production URL** (e.g., `https://squadlink.vercel.app`)
3. **Open on mobile** - Visit the URL on your phone's browser
4. **Install** - Follow prompts to add to home screen

### Option 2: Test Locally on Same Network

1. **Find your local IP address**:
```bash
# On Mac/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# On Windows
ipconfig
# Look for IPv4 Address (e.g., 192.168.1.100)
```

2. **Start your app**:
```bash
cd frontend
npm run build
npm start
# App runs on http://localhost:3000
```

3. **Access from mobile**:
   - Make sure phone is on same WiFi network
   - Open browser on phone
   - Visit: `http://YOUR_IP_ADDRESS:3000`
   - Example: `http://192.168.1.100:3000`

⚠️ **Note**: Service Worker only works in production mode. For local testing, you need to build first (`npm run build` then `npm start`).

### Option 3: Use Tunneling Service (Best for Local Testing)

#### Using ngrok (Recommended)

1. **Install ngrok**:
```bash
# Mac
brew install ngrok

# Or download from https://ngrok.com/download
```

2. **Start your app**:
```bash
cd frontend
npm run build
npm start
```

3. **Create tunnel**:
```bash
ngrok http 3000
```

4. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

5. **Open on mobile** - Visit the ngrok URL on your phone

#### Using Cloudflare Tunnel (Free Alternative)

```bash
# Install cloudflared
brew install cloudflared

# Create tunnel
cloudflared tunnel --url http://localhost:3000
```

## 📱 Testing on Android

### Step 1: Open in Chrome
1. Open **Chrome** browser on Android
2. Visit your app URL (production or ngrok)
3. Wait for page to load

### Step 2: Install the App
**Method A - Automatic Prompt:**
- A banner will appear: "Add SquadLink to Home screen"
- Tap **"Add"** or **"Install"**

**Method B - Manual:**
1. Tap the **menu** (3 dots) in top right
2. Select **"Add to Home screen"** or **"Install app"**
3. Tap **"Add"** or **"Install"**

### Step 3: Verify Installation
1. Check your home screen - you should see the SquadLink icon
2. Tap the icon to open
3. App should open in **standalone mode** (no browser UI)

### Step 4: Test Features
- ✅ Login/Authentication
- ✅ Match History
- ✅ Parties
- ✅ All navigation
- ✅ Touch interactions

### Step 5: Check Service Worker
1. Open Chrome DevTools (connect via USB debugging)
2. Go to **Application** tab
3. Check **Service Workers** - should show "activated and running"
4. Check **Manifest** - should show all details

## 🍎 Testing on iOS

### Step 1: Open in Safari
1. Open **Safari** browser on iOS (Chrome won't work for PWA installation)
2. Visit your app URL (production or ngrok)
3. Wait for page to load

### Step 2: Install the App
1. Tap the **Share button** (square with arrow) at bottom
2. Scroll down and tap **"Add to Home Screen"**
3. Edit the name if needed (default: "SquadLink")
4. Tap **"Add"** in top right

### Step 3: Verify Installation
1. Check your home screen - you should see the SquadLink icon
2. Tap the icon to open
3. App should open in **standalone mode** (no Safari UI)

### Step 4: Test Features
- ✅ Login/Authentication
- ✅ Match History
- ✅ Parties
- ✅ All navigation
- ✅ Touch interactions

## 🔍 Verification Checklist

### ✅ Manifest Works
- [ ] App icon appears on home screen
- [ ] App name is correct
- [ ] Opens in standalone mode (no browser UI)

### ✅ Service Worker Works
- [ ] App loads quickly (cached assets)
- [ ] Works offline (basic functionality)
- [ ] Updates automatically

### ✅ Features Work
- [ ] All pages load correctly
- [ ] Navigation works
- [ ] Forms work (login, etc.)
- [ ] Touch interactions work smoothly
- [ ] No horizontal scrolling issues
- [ ] Images load correctly

### ✅ Mobile Optimizations
- [ ] Buttons are easy to tap (not too small)
- [ ] No unwanted zoom on input focus
- [ ] Smooth scrolling
- [ ] Safe areas respected (notches)

## 🐛 Troubleshooting

### Installation Prompt Doesn't Appear

**Android:**
- Make sure you're using **Chrome** (not Firefox/Samsung Browser)
- Check that URL is **HTTPS** (or localhost)
- Clear browser cache and try again
- Check if app is already installed

**iOS:**
- Make sure you're using **Safari** (not Chrome)
- Check that URL is **HTTPS** (or localhost)
- Try manual installation via Share button

### Service Worker Not Working

1. **Check HTTPS**: Service Workers require HTTPS (except localhost)
2. **Check build**: Make sure you ran `npm run build` (not just `npm run dev`)
3. **Check console**: Look for errors in browser console
4. **Clear cache**: Clear browser cache and reload

### App Doesn't Open in Standalone Mode

1. **Check manifest.json**: Verify `"display": "standalone"`
2. **Reinstall app**: Uninstall and reinstall
3. **Check browser**: Make sure you installed from correct browser

### Features Don't Work

1. **Check network**: Some features need internet connection
2. **Check API**: Verify backend is accessible
3. **Check console**: Look for JavaScript errors
4. **Test on web first**: Make sure features work on desktop

## 🛠️ Advanced Testing

### Remote Debugging (Android)

1. **Enable USB Debugging** on Android:
   - Settings → About Phone → Tap "Build Number" 7 times
   - Settings → Developer Options → Enable "USB Debugging"

2. **Connect via USB** to computer

3. **Open Chrome DevTools**:
   - Chrome → `chrome://inspect`
   - Click "Inspect" on your device

4. **Test Service Worker**:
   - Application tab → Service Workers
   - Check status and test offline mode

### Remote Debugging (iOS)

1. **Enable Web Inspector** on iOS:
   - Settings → Safari → Advanced → Web Inspector (ON)

2. **Connect via USB** to Mac

3. **Open Safari DevTools**:
   - Safari → Develop → [Your Device] → [Your App]

## 📊 Testing Checklist

Before deploying to production, test:

- [ ] Installation works on Android
- [ ] Installation works on iOS
- [ ] App opens in standalone mode
- [ ] All pages load correctly
- [ ] Navigation works
- [ ] Forms work (login, register, etc.)
- [ ] Touch interactions are smooth
- [ ] No layout issues on different screen sizes
- [ ] Service Worker caches correctly
- [ ] Offline mode works (basic)
- [ ] Updates work correctly

## 🎯 Quick Test Commands

```bash
# 1. Build for production
cd frontend
npm run build

# 2. Start production server
npm start

# 3. In another terminal, create tunnel (if needed)
ngrok http 3000

# 4. Open on mobile using the URL
```

## 📝 Notes

- **Service Worker only works in production mode** (`npm run build` + `npm start`)
- **HTTPS required** for installation (except localhost)
- **iOS requires Safari** for installation (Chrome won't work)
- **Android works with Chrome** or Edge
- **Local testing** works with same network or tunneling

---

**Ready to test!** Follow the steps above and your PWA will work exactly like the web version on mobile! 🚀

