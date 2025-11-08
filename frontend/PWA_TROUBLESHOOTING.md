# 🔧 PWA Troubleshooting Guide - squadlink.me

## ✅ What I Just Fixed

1. **Added explicit manifest link** in `<head>` - This was missing!
2. **Improved service worker registration** - Now works better
3. **Added install prompt handling** - Better Android support

## 🔍 How to Check if PWA is Working

### Step 1: Verify Manifest is Accessible

Open in browser (desktop or mobile):
```
https://squadlink.me/manifest.json
```

You should see the JSON manifest. If you get 404, the file isn't being served.

### Step 2: Check on Mobile Browser

**Android (Chrome):**
1. Open Chrome on Android
2. Visit `https://squadlink.me`
3. Open menu (3 dots) → **"Add to Home screen"** or **"Install app"**
4. If option is grayed out, check console for errors

**iOS (Safari):**
1. Open Safari on iOS
2. Visit `https://squadlink.me`
3. Tap Share button (□↑) → **"Add to Home Screen"**
4. This should always work if manifest is valid

### Step 3: Check Browser Console

On mobile, use remote debugging:

**Android:**
1. Connect phone via USB
2. Enable USB debugging
3. Chrome → `chrome://inspect`
4. Click "Inspect" on your device
5. Check Console for errors

**iOS:**
1. Connect iPhone to Mac
2. Settings → Safari → Advanced → Web Inspector (ON)
3. Safari → Develop → [Your Device] → [Your App]
4. Check Console

### Step 4: Verify Service Worker

In DevTools:
1. Go to **Application** tab
2. Check **Service Workers** - should show "activated and running"
3. Check **Manifest** - should show all details
4. Look for any errors

## 🐛 Common Issues & Solutions

### Issue 1: Install Prompt Doesn't Appear

**Possible Causes:**
- App already installed
- Manifest not accessible
- Service Worker not registered
- Browser doesn't support PWA

**Solutions:**
1. **Check if already installed:**
   - Android: Check home screen for app icon
   - iOS: Check home screen for app icon
   - Uninstall if needed and try again

2. **Verify manifest is accessible:**
   ```bash
   curl -I https://squadlink.me/manifest.json
   ```
   Should return 200 OK

3. **Check service worker:**
   - DevTools → Application → Service Workers
   - Should show registered and active

4. **Try manual installation:**
   - Android: Menu → "Add to Home screen"
   - iOS: Share → "Add to Home Screen"

### Issue 2: Service Worker Not Registering

**Check:**
1. Is HTTPS enabled? (Required except localhost)
2. Is `/sw.js` accessible? Try: `https://squadlink.me/sw.js`
3. Check console for errors
4. Clear browser cache

**Fix:**
- Ensure `public/sw.js` exists
- Ensure service worker registration code runs
- Check network tab for 404 errors

### Issue 3: Manifest Not Detected

**Check:**
1. Is manifest link in `<head>`? (Now fixed ✅)
2. Is manifest.json valid JSON?
3. Are all icon paths correct?
4. Check manifest in DevTools → Application → Manifest

**Validate manifest:**
- Visit: https://manifest-validator.appspot.com/
- Paste your manifest URL: `https://squadlink.me/manifest.json`

### Issue 4: Icons Not Loading

**Check:**
1. Are icon files in `/public` folder?
2. Are paths correct in manifest?
3. Try accessing directly:
   - `https://squadlink.me/icon.png`
   - `https://squadlink.me/apple-icon.png`

## 📋 Deployment Checklist

After deploying, verify:

- [ ] `https://squadlink.me/manifest.json` is accessible
- [ ] `https://squadlink.me/sw.js` is accessible
- [ ] `https://squadlink.me/icon.png` is accessible
- [ ] Manifest link is in HTML `<head>`
- [ ] Service Worker registers without errors
- [ ] HTTPS is enabled (required for PWA)

## 🧪 Quick Test Commands

```bash
# 1. Check manifest
curl https://squadlink.me/manifest.json

# 2. Check service worker
curl -I https://squadlink.me/sw.js

# 3. Check icons
curl -I https://squadlink.me/icon.png
curl -I https://squadlink.me/apple-icon.png

# 4. Validate manifest
# Visit: https://manifest-validator.appspot.com/
# Enter: https://squadlink.me/manifest.json
```

## 🎯 What to Do Now

1. **Redeploy** with the fixes I made:
   - Added `<link rel="manifest" href="/manifest.json" />` in head
   - Improved service worker registration
   - Better install prompt handling

2. **After redeploy**, test again:
   - Clear browser cache
   - Visit `https://squadlink.me` on mobile
   - Try manual installation (Menu → Add to Home screen)

3. **Check console** for any errors

4. **Verify files are accessible:**
   - `https://squadlink.me/manifest.json`
   - `https://squadlink.me/sw.js`
   - `https://squadlink.me/icon.png`

## 📱 Installation Methods

### Android - Manual Installation
1. Open Chrome
2. Visit `https://squadlink.me`
3. Tap **Menu** (3 dots) → **"Add to Home screen"** or **"Install app"**
4. Tap **"Add"** or **"Install"**

### iOS - Manual Installation
1. Open Safari
2. Visit `https://squadlink.me`
3. Tap **Share** button (□↑)
4. Tap **"Add to Home Screen"**
5. Tap **"Add"**

## 🔍 Debugging Steps

1. **Open DevTools** (remote debugging on mobile)
2. **Check Application tab:**
   - Manifest: Should show all details
   - Service Workers: Should be registered
   - Storage: Check cache
3. **Check Console:**
   - Look for `[PWA]` messages
   - Look for any errors
4. **Check Network:**
   - Verify manifest.json loads (200 status)
   - Verify sw.js loads (200 status)
   - Verify icons load (200 status)

## ⚠️ Important Notes

- **HTTPS is required** for PWA installation (except localhost)
- **Service Worker must be registered** for install prompt (Android)
- **iOS always allows manual installation** via Share button
- **Browser must support PWA** (Chrome Android, Safari iOS)
- **App must meet PWA criteria** (manifest, service worker, HTTPS)

## 🎉 Expected Behavior

After fixes:
- ✅ Manifest is detected
- ✅ Service Worker registers
- ✅ Install prompt appears (Android) or manual install works (iOS)
- ✅ App installs to home screen
- ✅ App opens in standalone mode

---

**Next Steps:** Redeploy and test again. The explicit manifest link should fix the issue!

