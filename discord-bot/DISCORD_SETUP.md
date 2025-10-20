# 🎯 CRITICAL: Discord Developer Portal Setup

## 🚨 MUST DO BEFORE RUNNING BOT

### Step 1: Get Your Bot Token

1. Open: https://discord.com/developers/applications/1427654881656836249/bot
2. Look for **"TOKEN"** section
3. Click **"Reset Token"** button
4. Click **"Yes, do it!"** to confirm
5. **COPY THE TOKEN** (you'll only see it once!)
6. Save it somewhere safe temporarily

### Step 2: Enable Required Intents (CRITICAL!)

**Still on the Bot page**, scroll down to **"Privileged Gateway Intents"** section:

\`\`\`
┌─────────────────────────────────────────────────────┐
│  Privileged Gateway Intents                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ☑️ PRESENCE INTENT                                 │
│  └─ Allows bot to see member presence               │
│                                                     │
│  ☑️ SERVER MEMBERS INTENT                           │
│  └─ Allows bot to receive member events             │
│                                                     │
│  ☑️ MESSAGE CONTENT INTENT        ← MUST ENABLE!    │
│  └─ Allows bot to read message content              │
│                                                     │
└─────────────────────────────────────────────────────┘
\`\`\`

**Turn ON all three toggles!** Then click **"Save Changes"** at the bottom.

### Step 3: Verify Bot Permissions

1. Go to **OAuth2 → URL Generator** (left sidebar)
2. Check these are selected:
   - ✅ **Scopes**: bot
   - ✅ **Bot Permissions**: Administrator (8)

### Step 4: Add Token to .env File

\`\`\`bash
cd /Users/elyesdarouich/Desktop/SquadLink/discord-bot
\`\`\`

Open \`.env\` file and replace this line:

**BEFORE:**
\`\`\`env
DISCORD_BOT_TOKEN=your_bot_token_here
\`\`\`

**AFTER:**
\`\`\`env
DISCORD_BOT_TOKEN=MTQyNzY1NDg4MTY1NjgzNjI0OQ.paste_your_actual_token_here
\`\`\`

(The token will be a long string like: \`MTQyNzY1NDg4MTY1NjgzNjI0OQ.GxBkZL.nR3t7z...\`)

### Step 5: Verify Bot is in Server

1. Go to your Discord server
2. Look at member list (right side)
3. You should see your bot listed (probably offline/gray)
4. If NOT there, use this invite link:

\`\`\`
https://discord.com/oauth2/authorize?client_id=1427654881656836249&permissions=8&scope=bot
\`\`\`

---

## ✅ Quick Verification Checklist

Before running \`npm run dev\`:

- [ ] Bot token copied from Developer Portal
- [ ] Token pasted in \`.env\` file
- [ ] **MESSAGE CONTENT INTENT** enabled (toggle ON)
- [ ] PRESENCE INTENT enabled (toggle ON)
- [ ] SERVER MEMBERS INTENT enabled (toggle ON)
- [ ] Bot shows in your Discord server member list
- [ ] Bot has Administrator role/permission

---

## 🚀 Then Run:

\`\`\`bash
cd /Users/elyesdarouich/Desktop/SquadLink/discord-bot
npm run dev
\`\`\`

You should see:
\`\`\`
🤖 SquadLink AI Agent is ready!
✅ Logged in as YourBotName#1234
🏰 Connected to guild: Your Server Name
👥 Members: X
🤖 AI Agent analyzing server structure...
📋 Server plan generated: {...}
🎭 Creating roles...
✅ Created role: 👑 Admin
✅ Created role: 🛡️ Moderator
...
✅ Server structure setup complete!
\`\`\`

---

## 🐛 Common Issues

### Issue: Bot not responding to !commands
**Cause:** Message Content Intent not enabled
**Fix:** Go to Developer Portal → Bot → Enable "Message Content Intent"

### Issue: Error "An invalid token was provided"
**Cause:** Wrong token in .env or token expired
**Fix:** 
1. Reset token in Developer Portal
2. Copy NEW token
3. Update .env
4. Restart bot

### Issue: Bot joins but immediately leaves
**Cause:** Bot doesn't have permissions
**Fix:** Re-invite with Administrator permission using invite URL

### Issue: "Cannot find module 'discord.js'"
**Cause:** Dependencies not installed
**Fix:** Run \`npm install\`

---

## 📋 Environment File Reference

Your \`.env\` should look like this:

\`\`\`env
# Discord Bot Configuration
DISCORD_BOT_TOKEN=MTQyNzY1NDg4MTY1NjgzNjI0OQ.GxBkZL.YOUR_ACTUAL_TOKEN_HERE
DISCORD_CLIENT_ID=1427654881656836249
DISCORD_GUILD_ID=1427653997191499817

# Gemini AI Configuration (already configured)
GEMINI_API_KEY=AIzaSyBftaCGA6HllOs6b8eG9pOeOa_uS2CnWm8
GEMINI_MODEL=gemini-2.0-flash-exp

# Bot Configuration
BOT_PREFIX=!
ADMIN_CHANNEL_NAME=bot-commands
LOG_CHANNEL_NAME=bot-logs

# SquadLink Backend
BACKEND_URL=http://localhost:3001
\`\`\`

**Only thing you need to change: DISCORD_BOT_TOKEN**

---

## 🎮 After Bot Starts Successfully

Test these commands in Discord:

\`\`\`
!ping          → Should reply with latency
!help          → Shows all commands
!stats         → Shows server stats
!setup         → Creates server structure (admin only, use in #bot-commands)
!ask What games are supported?  → AI responds
\`\`\`

---

**REMEMBER**: The most common mistake is forgetting to enable **Message Content Intent**! 
Without it, the bot can't read your commands.
