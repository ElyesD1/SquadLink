# Discord Integration Setup Guide

## Overview
This guide will help you complete the Discord OAuth integration for SquadLink, enabling automatic voice channel allocation for parties.

## ✅ Completed Steps
- [x] Discord Application Created (Client ID: 1427654881656836249)
- [x] OAuth2 Configuration Set
- [x] Client Secret Generated
- [x] Backend Discord Module Implemented
- [x] Frontend Discord Component Created
- [x] Environment Variables Added

## 🔧 Required Setup Steps

### Step 1: Get Your Bot Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications/1427654881656836249/bot)
2. In the **Bot** section, click **"Reset Token"**
3. Copy the token that appears (⚠️ **It only shows once!**)
4. Save it securely

### Step 2: Set Bot Permissions

In the **Bot Permissions** section, enable these permissions:

#### Required Permissions:
- ✅ **Manage Channels** - Create voice channels for parties
- ✅ **Create Instant Invite** - Generate invite links for voice channels
- ✅ **View Channels** - See server channels
- ✅ **Send Messages** - Send notifications (optional)
- ✅ **Connect** (Voice) - Connect to voice channels
- ✅ **Move Members** (Voice) - Move users between channels

**Copy the "Permissions Integer" value at the bottom** (you'll need this for step 3)

### Step 3: Invite Bot to Your Discord Server

Use this URL (replace `PERMISSIONS_INTEGER` with the value from step 2):

```
https://discord.com/oauth2/authorize?client_id=1427654881656836249&permissions=PERMISSIONS_INTEGER&scope=bot
```

Example with common permissions (16785408):
```
https://discord.com/oauth2/authorize?client_id=1427654881656836249&permissions=16785408&scope=bot
```

Click the link and select your Discord server to add the bot.

### Step 4: Get Your Discord Server (Guild) ID

1. Open Discord Desktop/Web App
2. Go to **User Settings** → **Advanced** → Enable **"Developer Mode"**
3. Right-click on your server icon → Click **"Copy Server ID"**
4. Save this ID

### Step 5: Update Backend Environment Variables

Edit `/backend/.env` and replace these values:

```env
DISCORD_BOT_TOKEN=YOUR_BOT_TOKEN_HERE          # From Step 1
DISCORD_GUILD_ID=YOUR_GUILD_ID_HERE            # From Step 4
```

The other Discord variables are already configured:
- ✅ DISCORD_CLIENT_ID=1427654881656836249
- ✅ DISCORD_CLIENT_SECRET=zQiPhX4BaqJvEQJ1rCFWQH7Ab5CVFtHP
- ✅ DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/discord/callback

### Step 6: Restart Your Backend Server

```bash
cd backend
npm run start:dev
```

## 🎯 How It Works

### User Flow:
1. **Party Created** → User fills a party with members
2. **Discord Integration** → Party page shows "Connect to Discord" button
3. **OAuth Login** → User clicks button → Redirects to Discord OAuth
4. **Auto-Join Server** → User authorizes → Automatically joins your Discord server
5. **Voice Channel Created** → Party owner clicks "Create Voice Channel"
6. **Invite Link Generated** → System creates dedicated voice channel with invite link
7. **Team Communication** → All party members join the voice channel

### Technical Flow:
- **OAuth Scopes**: `identify`, `email`, `guilds.join`
- **Voice Channel**: Type 2 (voice), User limit 5, Auto-expires after 1 hour
- **Invite Link**: Max 10 uses, 1 hour expiration
- **Channel Name Format**: `🎮 {partyName}`

## 🧪 Testing

### Test the Complete Flow:

1. **Start Backend & Frontend**:
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run start:dev
   
   # Terminal 2 - Frontend  
   cd frontend && npm run dev
   ```

2. **Create a Party** with full members (5/5)

3. **Click "Connect to Discord"** → Should redirect to Discord OAuth

4. **Authorize the App** → Should join your Discord server automatically

5. **Create Voice Channel** (as party owner) → Should create channel & return invite link

6. **Click "Join Voice Channel"** → Should open Discord voice channel

## 🐛 Troubleshooting

### Bot Not Joining Server?
- Verify bot token is correct in `.env`
- Check bot has "guilds.join" scope in OAuth URL
- Ensure user authorized with all required scopes

### Voice Channel Not Creating?
- Verify bot is in your Discord server
- Check bot has "Manage Channels" permission
- Verify GUILD_ID matches your server

### OAuth Redirect Fails?
- Ensure DISCORD_REDIRECT_URI matches exactly: `http://localhost:3000/api/auth/discord/callback`
- Check it's added in Discord Developer Portal → OAuth2 → Redirects

## 📝 Production Deployment

When deploying to production, update these values:

```env
DISCORD_REDIRECT_URI=https://yourdomain.com/api/auth/discord/callback
FRONTEND_URL=https://yourdomain.com
```

And add the production redirect URI to Discord Developer Portal.

## 🔗 Useful Links

- [Discord Developer Portal](https://discord.com/developers/applications/1427654881656836249)
- [Discord OAuth2 Documentation](https://discord.com/developers/docs/topics/oauth2)
- [Discord Bot Guide](https://discord.com/developers/docs/topics/gateway)
- Your Discord Server: https://discord.gg/8SdDKFc4k2

## ✨ Features Implemented

- ✅ Discord OAuth2 Login
- ✅ Automatic Server Join
- ✅ Voice Channel Creation
- ✅ Invite Link Generation
- ✅ Channel Auto-Cleanup
- ✅ Party-Specific Channels
- ✅ Owner-Only Controls
