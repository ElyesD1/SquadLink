# 🚀 QUICK START - Discord AI Agent

## ⚡ 3-Step Setup (5 Minutes Total)

### ✅ Step 1: Enable Discord Intents (2 min)

1. Open: **https://discord.com/developers/applications/1427654881656836249/bot**

2. Scroll to **"Privileged Gateway Intents"**

3. **Turn ON all 3 toggles:**
   - ☑️ Presence Intent
   - ☑️ Server Members Intent  
   - ☑️ **Message Content Intent** ← CRITICAL!

4. Click **"Save Changes"**

---

### ✅ Step 2: Run the Bot (1 min)

\`\`\`bash
cd /Users/elyesdarouich/Desktop/SquadLink/discord-bot
npm run dev
\`\`\`

**You should see:**
\`\`\`
🤖 SquadLink AI Agent is ready!
✅ Logged in as SquadLink#XXXX
🏰 Connected to guild: Your Server
✅ Server structure setup complete!
\`\`\`

---

### ✅ Step 3: Test in Discord (2 min)

Go to your Discord server and type:

\`\`\`
!ping
!help
!stats
!setup
\`\`\`

**Done!** 🎉 Your Discord server is now AI-powered!

---

## 🎯 What The Bot Does

### Automatic (No Commands Needed):
- ✅ Creates perfect server structure (categories, channels, roles)
- ✅ Auto-creates voice channels when parties are created
- ✅ Welcomes new members
- ✅ Monitors server health
- ✅ Cleans up empty channels

### On-Demand Commands:

**Anyone can use:**
- \`!help\` - Show commands
- \`!ping\` - Check latency  
- \`!stats\` - Server statistics
- \`!ask <question>\` - Ask AI anything

**Admin only (in #bot-commands):**
- \`!setup\` - Initialize server structure
- \`!analyze\` - AI health analysis
- \`!cleanup\` - Remove empty channels

---

## 🏗️ What Gets Created

### 6 Categories:
1. **📋 INFORMATION** - Welcome, rules, announcements
2. **🎮 PARTY HUB** - Party lobby, LFG channels
3. **🔊 VOICE CHANNELS** - General, competitive, chill
4. **💬 COMMUNITY** - Chat, memes, clips
5. **🎨 PARTY ROOMS** - Auto party channels
6. **⚙️ ADMIN** - Bot commands, logs (admin-only)

### 5 Roles:
- 👑 Admin (red)
- 🛡️ Moderator (orange)
- 🎮 Party Leader (green)
- ✅ Member (blue)
- 👋 Guest (gray)

### 20+ Channels:
All organized, themed, and permission-locked appropriately!

---

## 🔧 Already Configured

✅ **Bot Token** - Copied from backend .env  
✅ **Gemini AI** - API key configured  
✅ **Dependencies** - All installed  
✅ **TypeScript** - Compiled successfully  
✅ **Guild/Client IDs** - Set correctly  

**You only need to enable the Discord intents!**

---

## 🐛 Troubleshooting

### Bot not responding?
→ Enable "Message Content Intent" in Discord Developer Portal

### Bot offline?
→ Make sure \`npm run dev\` is running

### Commands don't work?
→ Admin commands only work in #bot-commands channel

### "Invalid token" error?
→ Token is already configured, should work fine

---

## 📚 Documentation

- **CHECKLIST.md** - Pre-flight checklist
- **SETUP.md** - Detailed setup guide
- **DISCORD_SETUP.md** - Discord portal walkthrough  
- **COMPLETE_GUIDE.md** - Everything explained
- **ARCHITECTURE.md** - Technical architecture
- **README.md** - Full documentation

---

## 🎮 Integration With SquadLink

When a user creates a party:
1. ✅ Backend saves party to database
2. ✅ Bot creates voice channel automatically
3. ✅ AI generates creative channel name
4. ✅ Invite link stored in party document
5. ✅ Frontend shows "Join Voice Channel" button
6. ✅ User clicks → Discord opens to voice
7. ✅ User is in voice chat with team!

---

## ⏱️ Time Required

- **Enable intents:** 2 minutes
- **Run bot:** 1 minute  
- **Test commands:** 2 minutes
- **Total:** 5 minutes

---

## 🆘 Support

If you get stuck:

1. Check console logs for errors
2. Verify intents enabled in Developer Portal
3. Make sure bot is running (\`npm run dev\`)
4. Test \`!ping\` first (simplest command)

**Most common issue:** Forgetting to enable Message Content Intent!

---

## 🎉 Ready to Launch!

**Your bot is 100% configured and ready to run!**

Just:
1. Enable intents (2 min)
2. Run \`npm run dev\` (30 sec)
3. Type \`!setup\` in Discord (30 sec)

**That's it!** Your server will be fully automated! 🚀

---

**Pro Tip:** Keep this terminal open to see bot logs in real-time:
\`\`\`bash
cd /Users/elyesdarouich/Desktop/SquadLink/discord-bot
npm run dev
\`\`\`

Every command execution, AI response, and server change will be logged! 📊
