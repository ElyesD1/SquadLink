# 🔧 Update Discord OAuth Redirect URI

## ⚠️ Important: You need to update the redirect URI in Discord Developer Portal

### The Issue:
The Discord OAuth callback was pointing to the frontend (`http://localhost:3000/api/auth/discord/callback`), but it should point to the **backend** (`http://localhost:3001/discord/callback`).

### Fix Steps:

1. **Go to Discord Developer Portal:**
   - Visit: https://discord.com/developers/applications/1427654881656836249/oauth2

2. **Update Redirect URI:**
   - In the **"Redirects"** section
   - **Remove:** `http://localhost:3000/api/auth/discord/callback`
   - **Add:** `http://localhost:3001/discord/callback`
   - Click **"Save Changes"**

3. **Restart Backend:**
   ```bash
   cd /Users/elyesdarouich/Desktop/SquadLink/backend
   npm run start:dev
   ```

### Updated Configuration:
✅ Backend `.env` now has: `DISCORD_REDIRECT_URI=http://localhost:3001/discord/callback`

### How It Works:
1. User clicks "Join Discord Server" button
2. Redirects to Discord OAuth (backend URL)
3. User authorizes
4. Discord redirects to: `http://localhost:3001/discord/callback` (BACKEND)
5. Backend handles OAuth, adds user to guild
6. Backend redirects user to: `http://localhost:3000/parties/{partyId}` (FRONTEND)

### After This Fix:
✅ Discord OAuth will work correctly
✅ Users will auto-join your Discord server
✅ Users will be redirected back to the party page
