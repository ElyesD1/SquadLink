# 🚀 Quick Start - Discord Integration

## You Need to Get These 2 Values:

### 1. BOT TOKEN (From Discord Developer Portal)
- Go to: https://discord.com/developers/applications/1427654881656836249/bot
- Click "Reset Token" → Copy token
- **Save it! You only see it once!**

### 2. GUILD ID (From Discord App)
- Enable Developer Mode in Discord settings
- Right-click your server → "Copy Server ID"

---

## Then Update This File:

**File:** `/Users/elyesdarouich/Desktop/SquadLink/backend/.env`

```env
# Add these two lines (replace with your values):
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_GUILD_ID=your_guild_id_here
```

---

## Then Run:

```bash
# Terminal 1 - Backend
cd /Users/elyesdarouich/Desktop/SquadLink/backend
npm run start:dev

# Terminal 2 - Frontend
cd /Users/elyesdarouich/Desktop/SquadLink/frontend
npm run dev
```

---

## Then Test:

1. **Create/Join a party** (5/5 members)
2. **Click "Join Discord Server"** in party card
3. **Authorize on Discord**
4. **Click "Create Voice Channel"** (owner only)
5. **Click "Join Voice Channel"**
6. **🎉 You're in voice chat!**

---

## ⚠️ Before Testing - Invite Bot to Server:

**Set bot permissions first:**
- Go to Bot page → Bot Permissions section
- Check: Manage Channels, Create Instant Invite, View Channels, Send Messages, Connect, Move Members
- Copy "Permissions Integer" (e.g., 16785408)

**Then use this URL:**
```
https://discord.com/oauth2/authorize?client_id=1427654881656836249&permissions=16785408&scope=bot
```

Select your SquadLink server → Authorize

---

## 📋 Full Guides:
- **Detailed Setup:** `DISCORD_SETUP_GUIDE.md`
- **Next Steps:** `DISCORD_NEXT_STEPS.md`
