import { Message, Client, ChannelType } from 'discord.js';
import { AIAgent } from '../ai/geminiAgent';

export async function handleCommand(message: Message, aiAgent: AIAgent, client: Client) {
  const prefix = process.env.BOT_PREFIX || '!';
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  if (!command) return;

  // Only allow admin commands in bot-commands channel
  const isAdminChannel = message.channel.type === ChannelType.GuildText && 
                         message.channel.name === 'bot-commands';
  
  const adminCommands = ['setup', 'analyze', 'cleanup', 'reset'];
  
  if (adminCommands.includes(command) && !isAdminChannel) {
    return message.reply('⚠️ Admin commands can only be used in <#bot-commands> channel!');
  }

  switch (command) {
    case 'help':
      await handleHelp(message);
      break;
    
    case 'setup':
      await handleSetup(message, aiAgent);
      break;
    
    case 'analyze':
      await handleAnalyze(message, aiAgent);
      break;
    
    case 'ask':
      await handleAsk(message, aiAgent, args);
      break;
    
    case 'cleanup':
      await handleCleanup(message);
      break;
    
    case 'stats':
      await handleStats(message);
      break;
    
    case 'ping':
      await message.reply(`🏓 Pong! Latency: ${client.ws.ping}ms`);
      break;
    
    default:
      await message.reply(`❓ Unknown command. Use \`${prefix}help\` to see available commands.`);
  }
}

async function handleHelp(message: Message) {
  const prefix = process.env.BOT_PREFIX || '!';
  const embed = {
    color: 0x00ff00,
    title: '🤖 SquadLink AI Agent - Commands',
    description: 'AI-powered Discord server management for SquadLink',
    fields: [
      {
        name: '📋 General Commands',
        value: [
          `\`${prefix}help\` - Show this help message`,
          `\`${prefix}ping\` - Check bot latency`,
          `\`${prefix}stats\` - Show server statistics`,
          `\`${prefix}ask <question>\` - Ask the AI agent a question`,
        ].join('\n'),
      },
      {
        name: '⚙️ Admin Commands (bot-commands only)',
        value: [
          `\`${prefix}setup\` - Setup/refresh server structure`,
          `\`${prefix}analyze\` - Analyze server health`,
          `\`${prefix}cleanup\` - Clean up old party voice channels`,
        ].join('\n'),
      },
    ],
    footer: {
      text: 'SquadLink - Find your gaming squad!',
    },
  };

  await message.reply({ embeds: [embed] });
}

async function handleSetup(message: Message, aiAgent: AIAgent) {
  if (!message.member?.permissions.has('Administrator')) {
    return message.reply('❌ You need Administrator permissions to use this command!');
  }

  await message.reply('🤖 AI Agent is analyzing and setting up the server...');
  
  try {
    const { setupServerStructure } = await import('../setup/serverSetup');
    await setupServerStructure(message.guild!, aiAgent);
    
    await message.reply('✅ Server structure has been setup successfully!');
  } catch (error) {
    console.error('Setup error:', error);
    await message.reply('❌ Error setting up server. Check bot logs for details.');
  }
}

async function handleAnalyze(message: Message, aiAgent: AIAgent) {
  if (!message.member?.permissions.has('Administrator')) {
    return message.reply('❌ You need Administrator permissions to use this command!');
  }

  await message.reply('🤖 Analyzing server health...');

  const guild = message.guild!;
  const metrics = {
    totalMembers: guild.memberCount,
    totalChannels: guild.channels.cache.size,
    totalRoles: guild.roles.cache.size,
    voiceChannels: guild.channels.cache.filter(ch => ch.type === ChannelType.GuildVoice).size,
    textChannels: guild.channels.cache.filter(ch => ch.type === ChannelType.GuildText).size,
    onlineMembers: guild.members.cache.filter(m => m.presence?.status === 'online').size,
  };

  try {
    const analysis = await aiAgent.analyzeServerHealth(metrics);
    
    const embed = {
      color: 0x00aaff,
      title: '📊 Server Health Analysis',
      description: analysis,
      fields: [
        {
          name: '📈 Metrics',
          value: [
            `👥 Members: ${metrics.totalMembers}`,
            `📁 Channels: ${metrics.totalChannels}`,
            `🎭 Roles: ${metrics.totalRoles}`,
            `🟢 Online: ${metrics.onlineMembers}`,
          ].join('\n'),
        },
      ],
      timestamp: new Date().toISOString(),
    };

    await message.reply({ embeds: [embed] });
  } catch (error) {
    console.error('Analysis error:', error);
    await message.reply('❌ Error analyzing server. Check bot logs.');
  }
}

async function handleAsk(message: Message, aiAgent: AIAgent, args: string[]) {
  if (args.length === 0) {
    return message.reply('❓ Please provide a question! Example: `!ask How do I create a party?`');
  }

  const query = args.join(' ');
  
  // Send typing indicator if channel supports it
  if ('sendTyping' in message.channel) {
    await message.channel.sendTyping();
  }

  try {
    const context = {
      serverName: message.guild?.name,
      channelName: message.channel.type === ChannelType.GuildText ? message.channel.name : 'DM',
      userName: message.author.username,
    };

    const response = await aiAgent.handleUserQuery(query, context);
    await message.reply(response);
  } catch (error) {
    console.error('AI query error:', error);
    await message.reply('❌ Sorry, I encountered an error processing your question.');
  }
}

async function handleCleanup(message: Message) {
  if (!message.member?.permissions.has('Administrator')) {
    return message.reply('❌ You need Administrator permissions to use this command!');
  }

  await message.reply('🧹 Cleaning up old party voice channels...');

  const guild = message.guild!;
  const partyCategory = guild.channels.cache.find(
    ch => ch.name === '🎨 PARTY ROOMS' && ch.type === ChannelType.GuildCategory
  );

  if (!partyCategory) {
    return message.reply('❌ Party rooms category not found!');
  }

  const partyVoiceChannels = guild.channels.cache.filter(
    ch => ch.parentId === partyCategory.id && ch.type === ChannelType.GuildVoice
  );

  let deletedCount = 0;

  for (const [, channel] of partyVoiceChannels) {
    if (channel.type === ChannelType.GuildVoice && channel.members.size === 0) {
      try {
        await channel.delete('Cleanup: Empty party voice channel');
        deletedCount++;
      } catch (error) {
        console.error(`Error deleting channel ${channel.name}:`, error);
      }
    }
  }

  await message.reply(`✅ Cleaned up ${deletedCount} empty party voice channel(s).`);
}

async function handleStats(message: Message) {
  const guild = message.guild!;
  
  const embed = {
    color: 0x00ff00,
    title: `📊 ${guild.name} Statistics`,
    thumbnail: {
      url: guild.iconURL() || '',
    },
    fields: [
      {
        name: '👥 Members',
        value: `${guild.memberCount}`,
        inline: true,
      },
      {
        name: '📁 Channels',
        value: `${guild.channels.cache.size}`,
        inline: true,
      },
      {
        name: '🎭 Roles',
        value: `${guild.roles.cache.size}`,
        inline: true,
      },
      {
        name: '💬 Text Channels',
        value: `${guild.channels.cache.filter(ch => ch.type === ChannelType.GuildText).size}`,
        inline: true,
      },
      {
        name: '🔊 Voice Channels',
        value: `${guild.channels.cache.filter(ch => ch.type === ChannelType.GuildVoice).size}`,
        inline: true,
      },
      {
        name: '📅 Created',
        value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
  };

  await message.reply({ embeds: [embed] });
}
