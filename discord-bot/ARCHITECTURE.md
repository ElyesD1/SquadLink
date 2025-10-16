# 🏗️ SquadLink Discord AI Agent - Architecture

## 📊 System Architecture Diagram

\`\`\`
┌─────────────────────────────────────────────────────────────────────────┐
│                         SQUADLINK ECOSYSTEM                              │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   FRONTEND      │         │    BACKEND      │         │  DISCORD BOT    │
│   Next.js       │◄───────►│    NestJS       │◄───────►│  AI Agent       │
│   Port 3000     │         │   Port 3001     │         │  (This Project) │
└─────────────────┘         └─────────────────┘         └─────────────────┘
        │                            │                            │
        │                            │                            │
        ▼                            ▼                            ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   User Browser  │         │    MongoDB      │         │  Discord API    │
│   - Join Party  │         │  - Parties DB   │         │  - Guilds       │
│   - OAuth Flow  │         │  - Users DB     │         │  - Channels     │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                                                  │
                                                                  ▼
                                                         ┌─────────────────┐
                                                         │  Gemini AI API  │
                                                         │  - Analysis     │
                                                         │  - Generation   │
                                                         └─────────────────┘
\`\`\`

---

## 🔄 Data Flow

### 1️⃣ Party Creation Flow
\`\`\`
User (Frontend)
    │
    ├─► Create Party Request
    │
    ▼
Backend (NestJS)
    │
    ├─► Save to MongoDB
    ├─► Call Discord Service
    │
    ▼
Discord Bot
    │
    ├─► Ask Gemini AI for creative channel name
    ├─► Create voice channel
    ├─► Generate invite link
    │
    ▼
Backend
    │
    ├─► Store channel info in party document
    │
    ▼
Frontend
    │
    └─► Display "Join Voice Channel" button
\`\`\`

### 2️⃣ Discord OAuth Flow
\`\`\`
User clicks "Connect Discord"
    │
    ▼
Backend redirects to Discord OAuth
    │
    ▼
User authorizes app
    │
    ▼
Discord redirects back with code
    │
    ▼
Backend exchanges code for access token
    │
    ▼
Backend calls Discord API to add user to guild
    │
    ▼
User is now in Discord server
    │
    ▼
User clicks "Join Voice Channel" button
    │
    ▼
Discord app opens directly to voice channel
\`\`\`

### 3️⃣ Bot Command Flow
\`\`\`
User types "!setup" in Discord
    │
    ▼
Discord sends message event to Bot
    │
    ▼
Bot receives message via WebSocket
    │
    ▼
Command Handler parses command
    │
    ▼
Bot asks Gemini AI for server structure plan
    │
    ▼
Gemini AI analyzes context and generates plan
    │
    ▼
Bot executes plan:
    ├─► Create categories
    ├─► Create channels
    ├─► Create roles
    ├─► Set permissions
    │
    ▼
Bot sends confirmation to Discord
\`\`\`

---

## 🧩 Component Architecture

### Discord Bot Structure

\`\`\`
discord-bot/
│
├── src/index.ts (Main Entry Point)
│   ├─► Initialize Discord Client
│   ├─► Connect to Gemini AI
│   ├─► Setup event listeners
│   └─► Handle bot lifecycle
│
├── src/ai/geminiAgent.ts (AI Intelligence)
│   ├─► planServerSetup() - Generate structure
│   ├─► analyzeServerHealth() - Monitor metrics
│   ├─► handleUserQuery() - Answer questions
│   └─► generateRoomName() - Creative naming
│
├── src/setup/serverSetup.ts (Server Management)
│   ├─► setupServerStructure() - Initialize server
│   ├─► createRoles() - Role hierarchy
│   ├─► createChannelStructure() - Categories & channels
│   └─► setPermissions() - Security
│
└── src/commands/commandHandler.ts (Command Processing)
    ├─► handleCommand() - Route commands
    ├─► handleSetup() - !setup command
    ├─► handleAnalyze() - !analyze command
    ├─► handleAsk() - !ask command
    └─► handleCleanup() - !cleanup command
\`\`\`

---

## 🔐 Permission Model

\`\`\`
Discord Server
│
├── 👑 Admin Role (Administrator)
│   ├─► Full server permissions
│   ├─► Access to admin channels
│   ├─► Can use all bot commands
│   └─► Manage roles & channels
│
├── 🛡️ Moderator Role
│   ├─► Manage messages
│   ├─► Kick/mute members
│   └─► View admin channels (read-only)
│
├── 🎮 Party Leader Role
│   ├─► Create instant invites
│   ├─► Post in party channels
│   └─► Create voice channels
│
├── ✅ Member Role
│   ├─► Send messages
│   ├─► Join voice channels
│   └─► View all public channels
│
└── 👋 Guest Role
    ├─► View channels only
    └─► No send permissions
\`\`\`

---

## 🤖 AI Agent Workflow

### Initialization:
\`\`\`
Bot Starts
    │
    ├─► Load environment variables
    ├─► Connect to Discord API
    ├─► Initialize Gemini AI
    ├─► Fetch guild information
    │
    ▼
Analyze Current Structure
    │
    ├─► Count categories
    ├─► Count channels
    ├─► Count roles
    ├─► Identify missing components
    │
    ▼
Ask Gemini AI for Recommendations
    │
    ├─► Provide context: "This is a gaming party platform"
    ├─► Request structure plan
    ├─► Parse AI response (JSON)
    │
    ▼
Execute Setup Plan
    │
    ├─► Create missing categories
    ├─► Create missing channels
    ├─► Create missing roles
    ├─► Set permissions
    │
    ▼
Set Bot Status
    │
    └─► "SquadLink Parties | !help"
\`\`\`

### Command Processing:
\`\`\`
User Message Received
    │
    ├─► Check if starts with "!"
    │   └─► If not, ignore
    │
    ├─► Parse command and arguments
    │
    ├─► Check permissions
    │   ├─► Admin commands: Require admin role + bot-commands channel
    │   └─► Public commands: Anyone can use
    │
    ├─► Route to appropriate handler
    │   ├─► !help → Show command list
    │   ├─► !ping → Show latency
    │   ├─► !stats → Show server stats
    │   ├─► !ask → Ask Gemini AI
    │   ├─► !setup → Initialize structure (admin)
    │   ├─► !analyze → AI analysis (admin)
    │   └─► !cleanup → Remove empty channels (admin)
    │
    ├─► Execute command
    │
    └─► Send response to Discord
\`\`\`

---

## 📡 API Integrations

### Discord API (v10)
\`\`\`
Endpoints Used:
├─► /guilds/{guild_id}                 - Get guild info
├─► /guilds/{guild_id}/channels        - List/create channels
├─► /guilds/{guild_id}/roles           - List/create roles
├─► /channels/{channel_id}/invites     - Create invites
├─► /channels/{channel_id}/permissions - Set permissions
└─► /users/@me/guilds/{guild_id}       - Get member info

Events Subscribed:
├─► READY                - Bot initialized
├─► MESSAGE_CREATE       - New message (for commands)
├─► GUILD_MEMBER_ADD     - New member joined
└─► ERROR                - Error handling
\`\`\`

### Gemini AI API
\`\`\`
Model: gemini-2.0-flash-exp

Prompts:
├─► planServerSetup()
│   └─► Context: Gaming party platform
│       Output: JSON structure plan
│
├─► analyzeServerHealth()
│   └─► Context: Server metrics
│       Output: Recommendations
│
├─► handleUserQuery()
│   └─► Context: User question + server state
│       Output: Conversational response
│
└─► generateRoomName()
    └─► Context: Game + party name
        Output: Creative channel name
\`\`\`

---

## 💾 Data Storage

### Bot State (In-Memory)
\`\`\`typescript
{
  client: DiscordClient,
  aiAgent: GeminiAgent,
  guild: Guild,
  conversationHistory: []
}
\`\`\`

### MongoDB (via Backend)
\`\`\`typescript
Party Document:
{
  _id: ObjectId,
  name: string,
  game: string,
  members: User[],
  discordVoiceChannel: {
    channelId: string,
    channelName: string,
    inviteUrl: string,
    createdAt: Date
  }
}

User Document:
{
  _id: ObjectId,
  email: string,
  discordId: string,
  discordUsername: string,
  discordAvatar: string
}
\`\`\`

---

## 🔄 Event Loop

\`\`\`
Bot Running
    │
    ├──► Listen for Discord Events
    │    ├─► MESSAGE_CREATE
    │    ├─► GUILD_MEMBER_ADD
    │    └─► VOICE_STATE_UPDATE
    │
    ├──► Process Commands
    │    └─► If "!" prefix → Route to handler
    │
    ├──► AI Background Tasks
    │    ├─► Analyze server health (periodic)
    │    └─► Clean up empty channels (hourly)
    │
    └──► Respond to Events
         ├─► Send messages
         ├─► Create channels
         └─► Update roles
\`\`\`

---

## 🌐 Network Topology

\`\`\`
Internet
    │
    ├──────────────────────────────────────────┐
    │                                          │
    ▼                                          ▼
Discord Gateway (WebSocket)              Gemini API (HTTPS)
    │                                          │
    │ Persistent Connection                    │ REST Calls
    │                                          │
    ▼                                          ▼
Discord Bot (localhost)
    │
    ├─► Port: Random (WebSocket)
    ├─► Protocol: WSS (Secure WebSocket)
    └─► Intents: Gateway Intents Enabled
\`\`\`

---

## 🔒 Security Model

### Authentication:
\`\`\`
Bot Token (Discord)
    ├─► Stored in .env (git-ignored)
    ├─► Never committed to repository
    └─► Required for all Discord API calls

Gemini API Key
    ├─► Stored in .env (git-ignored)
    ├─► Used for AI requests
    └─► Rate-limited by Google

Admin Verification
    ├─► Check user has Admin role
    ├─► Check command used in bot-commands channel
    └─► Deny if either condition fails
\`\`\`

### Permissions:
\`\`\`
Bot Permissions (Administrator = 8)
    ├─► Manage Channels
    ├─► Manage Roles
    ├─► Send Messages
    ├─► Manage Messages
    ├─► Read Message History
    └─► Connect to Voice

Channel Permissions
    ├─► Admin channels: @everyone DENY, @Admin ALLOW
    ├─► Public channels: @everyone ALLOW
    └─► Party rooms: Dynamic per party
\`\`\`

---

## 📈 Scalability

### Current (Localhost):
- ✅ Single server (1 Discord guild)
- ✅ Unlimited members
- ✅ Unlimited parties
- ✅ Real-time command processing

### Future (Production):
- 🚀 Deploy to cloud (Heroku, Railway, etc.)
- 🚀 Multi-server support (multiple guilds)
- 🚀 Database for bot state
- 🚀 Load balancing for commands
- 🚀 Caching for AI responses

---

## 🧪 Testing Architecture

\`\`\`
Manual Testing:
├─► !ping → Verify bot responds
├─► !help → Verify command list
├─► !stats → Verify data fetching
├─► !ask → Verify AI integration
├─► !setup → Verify structure creation
└─► !cleanup → Verify channel deletion

Integration Testing:
├─► Create party on app → Voice channel created
├─► Join party → See Discord integration
├─► OAuth flow → User added to server
└─► Click voice button → Connect to voice

End-to-End:
User creates party
    → Backend creates party
    → Discord bot creates channel
    → User sees button on frontend
    → User clicks button
    → Discord opens to voice
    → User is in voice chat with party
\`\`\`

---

## 📊 Monitoring

### Console Logs:
\`\`\`
✅ Success messages (green check)
❌ Error messages (red X)
🤖 AI operations (robot emoji)
📋 Structure changes (clipboard emoji)
👥 Member events (people emoji)
\`\`\`

### Discord Logs (bot-logs channel):
- Bot startup/shutdown
- Command executions
- Structure changes
- Error events

### Metrics Tracked:
- Total members
- Active parties
- Channel count
- Command usage
- AI response time

---

This architecture provides a fully autonomous, AI-powered Discord server management system integrated with your SquadLink platform! 🚀
