import { Guild, ChannelType, PermissionFlagsBits, CategoryChannel } from 'discord.js';
import { AIAgent } from '../ai/geminiAgent';

export async function setupServerStructure(guild: Guild, aiAgent: AIAgent) {
  console.log('🤖 AI Agent analyzing server structure...');
  
  // Get AI recommendations
  const serverPlan = await aiAgent.planServerSetup();
  console.log('📋 Server plan generated:', JSON.stringify(serverPlan, null, 2));

  // Create roles first
  await createRoles(guild, serverPlan.roles || []);
  
  // Create categories and channels
  await createChannelStructure(guild, serverPlan.categories || []);
  
  console.log('✅ Server structure setup complete!');
}

async function createRoles(guild: Guild, roles: any[]) {
  console.log('🎭 Creating roles...');
  
  const defaultRoles = [
    {
      name: '👑 Admin',
      color: '#ff0000',
      permissions: [PermissionFlagsBits.Administrator],
      position: 5,
      hoist: true,
    },
    {
      name: '🛡️ Moderator',
      color: '#ff6b00',
      permissions: [
        PermissionFlagsBits.ManageMessages,
        PermissionFlagsBits.KickMembers,
        PermissionFlagsBits.MuteMembers,
      ],
      position: 4,
      hoist: true,
    },
    {
      name: '🎮 Party Leader',
      color: '#00ff00',
      permissions: [PermissionFlagsBits.CreateInstantInvite],
      position: 3,
      hoist: true,
    },
    {
      name: '✅ Member',
      color: '#00aaff',
      permissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.Connect],
      position: 2,
      hoist: false,
    },
    {
      name: '👋 Guest',
      color: '#888888',
      permissions: [PermissionFlagsBits.ViewChannel],
      position: 1,
      hoist: false,
    },
  ];

  const rolesToCreate = roles.length > 0 ? roles : defaultRoles;

  for (const roleData of rolesToCreate) {
    const existing = guild.roles.cache.find(r => r.name === roleData.name);
    if (!existing) {
      try {
        await guild.roles.create({
          name: roleData.name,
          color: roleData.color,
          permissions: roleData.permissions,
          hoist: roleData.hoist,
          position: roleData.position,
        });
        console.log(`✅ Created role: ${roleData.name}`);
      } catch (error) {
        console.error(`❌ Error creating role ${roleData.name}:`, error);
      }
    }
  }
}

async function createChannelStructure(guild: Guild, categories: any[]) {
  console.log('📁 Creating channel structure...');

  const defaultStructure = [
    {
      name: '📋 INFORMATION',
      position: 0,
      channels: [
        { name: 'welcome', type: 'text', description: 'Welcome to SquadLink!' },
        { name: 'rules', type: 'text', description: 'Server rules and guidelines' },
        { name: 'announcements', type: 'text', description: 'Important updates' },
        { name: 'getting-started', type: 'text', description: 'How to use SquadLink' },
      ],
    },
    {
      name: '🎮 PARTY HUB',
      position: 1,
      channels: [
        { name: 'party-lobby', type: 'text', description: 'Find and join parties' },
        { name: 'lfg-valorant', type: 'text', description: 'Looking for group - Valorant' },
        { name: 'lfg-league', type: 'text', description: 'Looking for group - League' },
        { name: 'lfg-other', type: 'text', description: 'Looking for group - Other games' },
      ],
    },
    {
      name: '🔊 VOICE CHANNELS',
      position: 2,
      channels: [
        { name: '🎙️ General Voice', type: 'voice', description: 'General voice chat' },
        { name: '🎵 Music Room', type: 'voice', description: 'Listen to music together' },
        { name: '🎯 Competitive', type: 'voice', description: 'Competitive gaming' },
        { name: '😎 Chill Zone', type: 'voice', description: 'Casual hangout' },
      ],
    },
    {
      name: '💬 COMMUNITY',
      position: 3,
      channels: [
        { name: 'general-chat', type: 'text', description: 'General discussion' },
        { name: 'memes', type: 'text', description: 'Share funny content' },
        { name: 'clips-highlights', type: 'text', description: 'Share your best plays' },
        { name: 'feedback', type: 'text', description: 'Platform feedback and suggestions' },
      ],
    },
    {
      name: '🎨 PARTY ROOMS',
      position: 4,
      channels: [
        { name: 'info', type: 'text', description: 'Party voice channels created here automatically' },
      ],
    },
    {
      name: '⚙️ ADMIN',
      position: 5,
      channels: [
        { name: 'bot-commands', type: 'text', description: 'Bot management commands' },
        { name: 'bot-logs', type: 'text', description: 'Bot activity logs' },
        { name: 'mod-chat', type: 'text', description: 'Moderator discussions' },
      ],
    },
  ];

  const structure = categories.length > 0 ? categories : defaultStructure;

  for (const categoryData of structure) {
    let category = guild.channels.cache.find(
      ch => ch.name === categoryData.name && ch.type === ChannelType.GuildCategory
    ) as CategoryChannel;

    if (!category) {
      try {
        category = await guild.channels.create({
          name: categoryData.name,
          type: ChannelType.GuildCategory,
          position: categoryData.position,
        });
        console.log(`✅ Created category: ${categoryData.name}`);
      } catch (error) {
        console.error(`❌ Error creating category ${categoryData.name}:`, error);
        continue;
      }
    }

    // Create channels in category
    for (const channelData of categoryData.channels) {
      const existing = guild.channels.cache.find(
        ch => ch.name === channelData.name && ch.parentId === category.id
      );

      if (!existing) {
        try {
          const channelType = channelData.type === 'voice' 
            ? ChannelType.GuildVoice 
            : ChannelType.GuildText;

          await guild.channels.create({
            name: channelData.name,
            type: channelType,
            parent: category.id,
            topic: channelData.description,
          });
          console.log(`✅ Created channel: ${channelData.name}`);
        } catch (error) {
          console.error(`❌ Error creating channel ${channelData.name}:`, error);
        }
      }
    }
  }

  // Set permissions for admin channels
  const adminCategory = guild.channels.cache.find(
    ch => ch.name === '⚙️ ADMIN' && ch.type === ChannelType.GuildCategory
  ) as CategoryChannel | undefined;

  if (adminCategory) {
    const adminRole = guild.roles.cache.find(r => r.name === '👑 Admin');
    const everyoneRole = guild.roles.everyone;

    if (adminRole) {
      await adminCategory.permissionOverwrites.set([
        {
          id: everyoneRole.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: adminRole.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
        },
      ]);
      console.log('✅ Set admin category permissions');
    }
  }
}
