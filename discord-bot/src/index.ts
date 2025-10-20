import { Client, GatewayIntentBits, Events, ChannelType, PermissionFlagsBits } from 'discord.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { setupServerStructure } from './setup/serverSetup';
import { handleCommand } from './commands/commandHandler';
import { AIAgent } from './ai/geminiAgent';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
  ],
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const aiAgent = new AIAgent(genAI, process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp');

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`🤖 SquadLink AI Agent is ready!`);
  console.log(`✅ Logged in as ${readyClient.user.tag}`);
  
  const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID!);
  
  if (guild) {
    console.log(`🏰 Connected to guild: ${guild.name}`);
    console.log(`👥 Members: ${guild.memberCount}`);
    
    // Setup server structure on startup
    try {
      await setupServerStructure(guild, aiAgent);
      console.log('✅ Server structure setup complete!');
    } catch (error) {
      console.error('❌ Error setting up server:', error);
    }
  }

  // Set bot status
  readyClient.user.setPresence({
    activities: [{ name: 'SquadLink Parties | !help' }],
    status: 'online',
  });
});

// Handle messages for commands
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  
  const prefix = process.env.BOT_PREFIX || '!';
  
  if (!message.content.startsWith(prefix)) return;
  
  await handleCommand(message, aiAgent, client);
});

// Handle new members joining
client.on(Events.GuildMemberAdd, async (member) => {
  const welcomeChannel = member.guild.channels.cache.find(
    (ch) => ch.name === 'welcome' && ch.type === ChannelType.GuildText
  );
  
  if (welcomeChannel && welcomeChannel.isTextBased()) {
    await welcomeChannel.send(
      `🎮 Welcome to SquadLink, ${member}! Use our platform to find gaming squads and party up! Check out <#${member.guild.channels.cache.find(ch => ch.name === 'getting-started')?.id}> to get started.`
    );
  }
});

// Handle errors
client.on(Events.Error, (error) => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

// Login
client.login(process.env.DISCORD_BOT_TOKEN);
