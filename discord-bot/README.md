# 🤖 SquadLink Discord AI Agent

An intelligent Discord bot powered by Google Gemini AI that manages your SquadLink Discord server with autonomous capabilities.

## 🌟 Features

### 🧠 AI-Powered Management
- **Intelligent Server Setup**: AI analyzes and creates optimal server structure
- **Smart Channel Organization**: Auto-organizes channels based on SquadLink context
- **Role Management**: Creates and manages role hierarchy automatically
- **Health Monitoring**: Analyzes server metrics and provides recommendations

### 🎮 SquadLink Integration
- **Party Room Management**: Auto-creates voice channels for gaming parties
- **Member Onboarding**: Welcome messages and getting started guides
- **LFG (Looking For Group)**: Dedicated channels for different games
- **Community Features**: Organized social and gaming channels

### 🛠️ Administrative Tools
- **Auto-cleanup**: Removes empty party voice channels
- **Server Analytics**: Detailed statistics and insights
- **Permission Management**: Secure admin channel access
- **Logging System**: Tracks all bot activities

## 📋 Prerequisites

1. **Discord Bot Token**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application
   - Go to "Bot" section and create a bot
   - Copy the bot token
   - **IMPORTANT**: Enable "Message Content Intent" in Bot settings

2. **Gemini API Key**
   - Already provided: `AIzaSyBftaCGA6HllOs6b8eG9pOeOa_uS2CnWm8`
   - Model: `gemini-2.0-flash-exp`

3. **Discord Server Setup**
   - Your bot must be invited with Administrator permissions
   - Server ID: `1427653997191499817`
   - Client ID: `1427654881656836249`

## 🚀 Setup Instructions

### Step 1: Install Dependencies

\`\`\`bash
cd /Users/elyesdarouich/Desktop/SquadLink/discord-bot
npm install
\`\`\`

### Step 2: Configure Environment

Edit `.env` file and add your Discord bot token:

\`\`\`env
DISCORD_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
DISCORD_CLIENT_ID=1427654881656836249
DISCORD_GUILD_ID=1427653997191499817

GEMINI_API_KEY=AIzaSyBftaCGA6HllOs6b8eG9pOeOa_uS2CnWm8
GEMINI_MODEL=gemini-2.0-flash-exp
\`\`\`

### Step 3: Invite Bot to Server

Use this URL to invite the bot (replace YOUR_CLIENT_ID):

\`\`\`
https://discord.com/oauth2/authorize?client_id=1427654881656836249&permissions=8&scope=bot
\`\`\`

**Permissions Required:**
- ✅ Administrator (for full server management)

### Step 4: Enable Discord Intents

**CRITICAL**: Go to Discord Developer Portal → Your App → Bot → Enable:
- ✅ **Presence Intent**
- ✅ **Server Members Intent**  
- ✅ **Message Content Intent** (REQUIRED!)

### Step 5: Run the Bot

#### Development Mode:
\`\`\`bash
npm run dev
\`\`\`

#### Production Mode:
\`\`\`bash
npm run build
npm start
\`\`\`

#### Watch Mode (auto-restart):
\`\`\`bash
npm run watch
\`\`\`

## 📝 Commands

### General Commands (Any Channel)
- \`!help\` - Display all available commands
- \`!ping\` - Check bot latency
- \`!stats\` - Show server statistics
- \`!ask <question>\` - Ask the AI agent a question

### Admin Commands (bot-commands channel only)
- \`!setup\` - Initialize/refresh server structure with AI
- \`!analyze\` - Get AI-powered server health analysis
- \`!cleanup\` - Remove empty party voice channels

## 🏗️ Server Structure

The AI agent creates this optimized structure:

### 📋 Categories

1. **📋 INFORMATION**
   - welcome
   - rules
   - announcements
   - getting-started

2. **🎮 PARTY HUB**
   - party-lobby
   - lfg-valorant
   - lfg-league
   - lfg-other

3. **🔊 VOICE CHANNELS**
   - 🎙️ General Voice
   - 🎵 Music Room
   - 🎯 Competitive
   - 😎 Chill Zone

4. **💬 COMMUNITY**
   - general-chat
   - memes
   - clips-highlights
   - feedback

5. **🎨 PARTY ROOMS**
   - (Auto-created party voice channels)

6. **⚙️ ADMIN** (Admin-only)
   - bot-commands
   - bot-logs
   - mod-chat

### 🎭 Roles

1. **👑 Admin** - Server administrators
2. **🛡️ Moderator** - Community helpers
3. **🎮 Party Leader** - Users who create parties
4. **✅ Member** - Verified users
5. **👋 Guest** - New users

## 🔧 How It Works

### AI Agent Workflow

1. **Server Analysis**: Gemini AI analyzes current Discord structure
2. **Optimization**: Generates recommendations based on SquadLink context
3. **Execution**: Bot implements approved changes automatically
4. **Monitoring**: Continuously monitors server health
5. **Maintenance**: Auto-cleanup of unused resources

### Party Integration

When a party is created on SquadLink:
1. Backend calls bot API to create voice channel
2. AI generates creative channel name
3. Channel created in "PARTY ROOMS" category
4. Invite link returned to backend
5. After 24h or when empty, channel is auto-deleted

## 🔐 Security

- Admin commands restricted to `bot-commands` channel
- Permission-based command access
- Secure environment variable handling
- Audit logging for all admin actions

## 🐛 Troubleshooting

### Bot not responding to commands?
- ✅ Check "Message Content Intent" is enabled in Discord Developer Portal
- ✅ Verify bot has permissions in the channel
- ✅ Ensure bot token is correct in `.env`

### Bot can't create channels?
- ✅ Bot needs Administrator permission
- ✅ Re-invite bot with correct permissions

### AI not responding?
- ✅ Verify Gemini API key is correct
- ✅ Check internet connection
- ✅ Look at console logs for errors

### Commands only work in some channels?
- ✅ Admin commands only work in `bot-commands` channel
- ✅ This is intentional for security

## 📊 Monitoring

Check bot logs for:
- ✅ Connection status
- ✅ Command execution
- ✅ AI responses
- ✅ Error messages

Logs appear in console and optionally in `bot-logs` Discord channel.

## 🔄 Auto-Cleanup

The bot automatically:
- 🗑️ Deletes empty party voice channels
- 🧹 Removes expired invites
- 📊 Monitors channel usage
- 🔧 Optimizes server structure

## 🎯 Use Cases

### For Server Admins:
1. Run \`!setup\` to initialize perfect server structure
2. Use \`!analyze\` weekly to get health reports
3. Run \`!cleanup\` to remove unused channels
4. Check \`!stats\` for server metrics

### For Members:
1. Use \`!help\` to see available commands
2. Ask questions with \`!ask How do I join a party?\`
3. Check server stats with \`!stats\`

### For Developers:
1. Bot integrates with SquadLink backend
2. Auto-creates voice channels via API
3. Syncs party data with Discord
4. Provides webhook endpoints

## 🚀 Production Deployment

For production (not localhost):

1. Update `.env`:
   \`\`\`env
   BACKEND_URL=https://your-production-backend.com
   \`\`\`

2. Deploy to hosting:
   - Heroku, Railway, DigitalOcean, etc.
   - Keep bot running 24/7

3. Set up process manager:
   \`\`\`bash
   npm install -g pm2
   pm2 start dist/index.js --name squadlink-bot
   pm2 save
   \`\`\`

## 📚 Architecture

\`\`\`
discord-bot/
├── src/
│   ├── index.ts              # Main bot entry point
│   ├── ai/
│   │   └── geminiAgent.ts    # AI agent logic
│   ├── setup/
│   │   └── serverSetup.ts    # Server structure setup
│   └── commands/
│       └── commandHandler.ts # Command processing
├── .env                      # Environment config
├── package.json
└── tsconfig.json
\`\`\`

## 🤝 Contributing

The bot is designed to be extended. Add new commands in \`commandHandler.ts\` and AI capabilities in \`geminiAgent.ts\`.

## 📞 Support

If you encounter issues:
1. Check console logs
2. Verify all setup steps
3. Ensure Discord intents are enabled
4. Check bot permissions in Discord server

---

**SquadLink Discord AI Agent** - Intelligent server management for gaming communities! 🎮🤖
