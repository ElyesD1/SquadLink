# 🚀 Quick Setup Guide for SquadLink Discord AI Agent

## ⚡ Fast Track Setup (5 Minutes)

### Step 1: Get Your Discord Bot Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications/1427654881656836249/bot)
2. Click on your application
3. Go to **"Bot"** section (left sidebar)
4. Click **"Reset Token"** and copy the new token
5. **CRITICAL**: Scroll down and enable these **Privileged Gateway Intents**:
   - ✅ **Presence Intent**
   - ✅ **Server Members Intent**
   - ✅ **Message Content Intent** ← MUST ENABLE THIS!

### Step 2: Install Bot Dependencies

\`\`\`bash
cd /Users/elyesdarouich/Desktop/SquadLink/discord-bot
npm install
\`\`\`

### Step 3: Configure Bot Token

Edit \`.env\` file and replace \`your_bot_token_here\` with your actual bot token:

\`\`\`bash
# Open .env file
code .env

# Or use nano
nano .env
\`\`\`

Update this line:
\`\`\`env
DISCORD_BOT_TOKEN=YOUR_ACTUAL_BOT_TOKEN_HERE
\`\`\`

### Step 4: Invite Bot to Server (If Not Already)

Your bot should already be in the server, but if not, use this URL:

\`\`\`
https://discord.com/oauth2/authorize?client_id=1427654881656836249&permissions=8&scope=bot
\`\`\`

**Make sure to select your SquadLink server!**

### Step 5: Run the Bot

\`\`\`bash
npm run dev
\`\`\`

You should see:
\`\`\`
🤖 SquadLink AI Agent is ready!
✅ Logged in as YourBotName#1234
🏰 Connected to guild: YourServerName
👥 Members: X
✅ Server structure setup complete!
\`\`\`

## 🎮 Test the Bot

Once running, go to your Discord server and try:

\`\`\`
!help
!setup
!stats
!ask How do I create a party?
\`\`\`

## ⚙️ What the Bot Does Automatically

On first startup, the AI agent will:

1. ✅ **Analyze your current server structure**
2. ✅ **Create optimized categories**:
   - 📋 INFORMATION (welcome, rules, announcements)
   - 🎮 PARTY HUB (party-lobby, lfg channels)
   - 🔊 VOICE CHANNELS (general, competitive, chill)
   - 💬 COMMUNITY (general-chat, memes, clips)
   - 🎨 PARTY ROOMS (for auto-created party channels)
   - ⚙️ ADMIN (bot-commands, bot-logs, mod-chat)

3. ✅ **Create role hierarchy**:
   - 👑 Admin
   - 🛡️ Moderator
   - 🎮 Party Leader
   - ✅ Member
   - 👋 Guest

4. ✅ **Set up permissions** (admin channels locked to admins only)

## 🤖 Bot Commands Reference

### Anyone Can Use:
- \`!help\` - Show all commands
- \`!ping\` - Check bot latency
- \`!stats\` - Server statistics
- \`!ask <question>\` - Ask AI a question

### Admin Only (in #bot-commands):
- \`!setup\` - Initialize/refresh server structure
- \`!analyze\` - AI server health analysis
- \`!cleanup\` - Remove empty party voice channels

## 🔧 Configuration Options

Edit \`.env\` to customize:

\`\`\`env
BOT_PREFIX=!                    # Change command prefix
ADMIN_CHANNEL_NAME=bot-commands # Change admin channel name
GEMINI_MODEL=gemini-2.0-flash-exp # AI model (already optimal)
\`\`\`

## 🐛 Troubleshooting

### ❌ Error: "Cannot find module 'discord.js'"
**Solution:** Run \`npm install\`

### ❌ Bot logs in but doesn't respond to commands
**Solution:** Enable "Message Content Intent" in Discord Developer Portal → Bot settings

### ❌ Error: "Invalid token"
**Solution:** 
1. Go to Discord Developer Portal
2. Bot section → Reset Token
3. Copy new token to \`.env\`
4. Restart bot

### ❌ Bot can't create channels/roles
**Solution:** Re-invite bot with Administrator permission using the invite URL above

### ❌ AI responses fail
**Solution:** Gemini API key is already configured, check your internet connection

## 🎯 What's Next?

1. **Run \`!setup\`** in Discord to initialize the server structure
2. **Assign roles** to your team members (Admin, Moderator, etc.)
3. **Create a party** on your SquadLink app - bot will auto-create voice channel!
4. **Test commands** to familiarize yourself with bot capabilities

## 📊 Bot Features

### AI-Powered Management:
- 🧠 Gemini AI analyzes and optimizes server structure
- 📊 Intelligent health monitoring and recommendations
- 🎨 Creative channel names for party rooms
- 💬 Natural language Q&A for users

### SquadLink Integration:
- 🎮 Auto-creates voice channels for parties
- 🗑️ Auto-cleanup of empty channels after 24h
- 👥 Welcome messages for new members
- 📢 Party announcements and LFG channels

### Administrative Tools:
- 🛡️ Permission-based command access
- 📝 Activity logging
- 🧹 Channel cleanup tools
- 📈 Server analytics

## 🔐 Security Notes

- ✅ Admin commands only work in \`#bot-commands\` channel
- ✅ Bot token stored securely in \`.env\` (git-ignored)
- ✅ Permission-based role hierarchy
- ✅ Audit logging for admin actions

## 🚀 Production Deployment (Later)

When ready to deploy 24/7:

1. **Choose hosting**: Heroku, Railway, DigitalOcean, etc.
2. **Set environment variables** on hosting platform
3. **Deploy code**: \`git push heroku main\`
4. **Use process manager**: \`pm2 start dist/index.js\`

For now, keep it running on localhost while testing!

---

## 📝 Quick Command Summary

\`\`\`bash
# Install
npm install

# Run (development)
npm run dev

# Run (production build)
npm run build
npm start

# Auto-restart on changes
npm run watch
\`\`\`

## ✅ Success Checklist

- [ ] Bot token added to \`.env\`
- [ ] Message Content Intent enabled in Discord
- [ ] Dependencies installed (\`npm install\`)
- [ ] Bot running (\`npm run dev\`)
- [ ] Bot appears online in Discord
- [ ] \`!help\` command works
- [ ] \`!setup\` command executed
- [ ] Server structure created
- [ ] Roles assigned to team

---

**You're all set!** 🎉 Your Discord server is now powered by AI and ready to enhance your SquadLink gaming community!
