# 📋 Discord Integration - Next Steps Summary

## ✅ What's Been Completed

### Backend Infrastructure
- ✅ Discord module created (`backend/src/discord/`)
- ✅ Discord service with OAuth2 + Bot API integration
- ✅ Discord controller with 3 REST endpoints:
  - `GET /discord/auth` - Initiates OAuth flow
  - `GET /discord/callback` - Handles OAuth callback & account linking
  - `GET /discord/voice-channel` - Creates voice channel for party
- ✅ User entity extended with Discord fields (discordId, username, avatar)
- ✅ Environment variables configured with your credentials

### Frontend Integration  
- ✅ DiscordIntegration component created
- ✅ Component integrated into My Parties section
- ✅ Shows Discord buttons when party is full (ready for voice chat)
- ✅ Owner can create voice channels
- ✅ Members can join Discord server

### Credentials Saved
- ✅ CLIENT_ID: 1427654881656836249
- ✅ CLIENT_SECRET: zQiPhX4BaqJvEQJ1rCFWQH7Ab5CVFtHP  
- ✅ REDIRECT_URI: http://localhost:3000/api/auth/discord/callback
- ✅ Discord Server: https://discord.gg/8SdDKFc4k2

## 🔧 What You Need to Do Now

### Step 1: Get Bot Token (CRITICAL)
1. Go to: https://discord.com/developers/applications/1427654881656836249/bot
2. Scroll to **"TOKEN"** section
3. Click **"Reset Token"** button
4. **IMMEDIATELY COPY** the token (you only see it once!)
5. Save it somewhere safe

### Step 2: Set Bot Permissions
1. Still on the Bot page, scroll to **"Bot Permissions"**
2. Check these boxes:
   - ✅ **Manage Channels**
   - ✅ **Create Instant Invite**  
   - ✅ **View Channels**
   - ✅ **Send Messages**
   - ✅ **Connect** (under Voice Permissions)
   - ✅ **Move Members** (under Voice Permissions)

3. **Copy the "Permissions Integer"** at the bottom (e.g., 16785408)

### Step 3: Invite Bot to Your Server
Use this URL (replace `PERMISSIONS_INTEGER`):
```
https://discord.com/oauth2/authorize?client_id=1427654881656836249&permissions=PERMISSIONS_INTEGER&scope=bot
```

Example with common permissions:
```
https://discord.com/oauth2/authorize?client_id=1427654881656836249&permissions=16785408&scope=bot
```

1. Click the URL in your browser
2. Select your Discord server: **SquadLink** (https://discord.gg/8SdDKFc4k2)
3. Click "Authorize"

### Step 4: Get Your Discord Server ID
1. Open Discord (desktop/web app)
2. **User Settings** → **Advanced** → Enable **"Developer Mode"**
3. Right-click on your **SquadLink** server icon
4. Click **"Copy Server ID"**
5. Save this ID

### Step 5: Update Environment Variables
Edit `/Users/elyesdarouich/Desktop/SquadLink/backend/.env`:

```env
DISCORD_BOT_TOKEN=paste_your_bot_token_here      # From Step 1
DISCORD_GUILD_ID=paste_your_server_id_here       # From Step 4
```

### Step 6: Restart Backend
```bash
cd /Users/elyesdarouich/Desktop/SquadLink/backend
npm run start:dev
```

### Step 7: Test the Full Flow
1. **Start both servers**:
   ```bash
   # Terminal 1
   cd backend && npm run start:dev
   
   # Terminal 2  
   cd frontend && npm run dev
   ```

2. **Create/Join a party** with 5/5 members

3. **Click "Join Discord Server"** → Should redirect to Discord OAuth

4. **Authorize** → Should join your Discord server automatically

5. **Click "Create Voice Channel"** (as owner) → Creates voice channel

6. **Click "Join Voice Channel"** → Opens Discord voice channel

## 🎯 Expected Workflow

```
User fills party (5/5) 
    ↓
Discord buttons appear in party card
    ↓
User clicks "Join Discord Server"
    ↓
Redirects to Discord OAuth (scopes: identify, email, guilds.join)
    ↓
User authorizes
    ↓
Automatically joins SquadLink Discord server
    ↓
Redirected back to party page
    ↓
Owner clicks "Create Voice Channel"
    ↓
System creates voice channel named "🎮 {partyName}"
    ↓
Invite link generated (1hr expiry, 10 uses max)
    ↓
Members click "Join Voice Channel"
    ↓
Opens Discord voice channel
    ↓
Team voice communication ready! 🎉
```

## 📝 Quick Checklist

- [ ] Got bot token from Discord Developer Portal
- [ ] Set bot permissions (Manage Channels, Create Invite, View Channels, Send Messages, Connect, Move Members)
- [ ] Invited bot to SquadLink Discord server  
- [ ] Got Discord server (guild) ID
- [ ] Updated `.env` with DISCORD_BOT_TOKEN
- [ ] Updated `.env` with DISCORD_GUILD_ID
- [ ] Restarted backend server
- [ ] Tested full flow: OAuth → Join server → Create channel → Join voice

## 🐛 Troubleshooting

**Bot token not working?**
- Make sure you copied the entire token
- No spaces at the start/end
- Reset token and try again

**Users not joining server?**
- Check OAuth URL has `guilds.join` scope
- Verify bot is in your Discord server
- Check bot has "Create Instant Invite" permission

**Voice channel not creating?**
- Verify GUILD_ID matches your server ID
- Check bot has "Manage Channels" permission
- Ensure bot role is high enough in server hierarchy

**OAuth redirect fails?**
- Verify DISCORD_REDIRECT_URI is exactly: `http://localhost:3000/api/auth/discord/callback`
- Check it's added in Discord Developer Portal → OAuth2 → Redirects

## 📚 Resources

- [Discord Setup Guide](./DISCORD_SETUP_GUIDE.md) - Detailed documentation
- [Discord Developer Portal](https://discord.com/developers/applications/1427654881656836249)
- [Your Discord Server](https://discord.gg/8SdDKFc4k2)

## 🚀 After Testing

Once everything works locally, for production deployment:
1. Update redirect URI to production URL
2. Add production URI to Discord Developer Portal
3. Update `FRONTEND_URL` in `.env`
4. Ensure bot is in production Discord server

---

**Need Help?** Check the detailed guide: `DISCORD_SETUP_GUIDE.md`
