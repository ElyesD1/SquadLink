import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

export class AIAgent {
  private model: GenerativeModel;
  private conversationHistory: Array<{ role: string; parts: string }> = [];

  constructor(genAI: GoogleGenerativeAI, modelName: string) {
    this.model = genAI.getGenerativeModel({ model: modelName });
  }

  async analyzeServerStructure(currentStructure: any): Promise<string> {
    const prompt = `
You are an AI assistant managing a Discord server for "SquadLink" - a gaming party/squad matchmaking platform.

Current server structure:
${JSON.stringify(currentStructure, null, 2)}

SquadLink Context:
- Platform where gamers create parties to find teammates
- Supports various games (Valorant, League of Legends, Fortnite, etc.)
- Parties have: name, game, max members, skill level, expiry (24h default)
- Users join parties, communicate via Discord voice channels
- Each party gets an auto-created Discord voice channel

Based on this context, suggest improvements for:
1. Channel organization (categories, channels)
2. Role structure (permissions, hierarchy)
3. Server aesthetics (emojis, descriptions)
4. Bot-managed features

Provide a concise, actionable response in JSON format with specific recommendations.
`;

    const result = await this.model.generateContent(prompt);
    const response = result.response;
    return response.text();
  }

  async planServerSetup(): Promise<any> {
    const prompt = `
You are setting up a Discord server for "SquadLink" - a gaming party matchmaking platform.

Design an optimal server structure with:

1. **Categories & Channels:**
   - Welcome/Info category
   - Party/Gaming category  
   - Community category
   - Voice channels category
   - Admin category

2. **Roles:**
   - Admin (server managers)
   - Moderator (community helpers)
   - Party Leader (users who create parties)
   - Member (verified users)
   - Guest (new users)

3. **Features:**
   - Auto-delete party voice channels after 24h
   - Welcome messages
   - Party announcements
   - Moderation tools

Return ONLY a valid JSON object with this structure:
{
  "categories": [
    {
      "name": "string",
      "position": number,
      "channels": [
        {
          "name": "string",
          "type": "text" | "voice",
          "description": "string",
          "permissions": {}
        }
      ]
    }
  ],
  "roles": [
    {
      "name": "string",
      "color": "string (hex)",
      "permissions": [],
      "position": number,
      "hoist": boolean
    }
  ]
}
`;

    const result = await this.model.generateContent(prompt);
    const response = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Could not parse AI response as JSON');
  }

  async handleUserQuery(query: string, context: any): Promise<string> {
    const prompt = `
You are the SquadLink Discord bot assistant. Answer this user query:

Query: ${query}

Server Context:
${JSON.stringify(context, null, 2)}

Provide a helpful, concise response (max 300 characters for Discord).
`;

    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }

  async generateRoomName(game: string, partyName: string): Promise<string> {
    const prompt = `
Generate a creative, short Discord voice channel name (max 25 chars) for:
Game: ${game}
Party: ${partyName}

Use emojis and make it appealing. Return ONLY the channel name, nothing else.
`;

    const result = await this.model.generateContent(prompt);
    return result.response.text().trim().substring(0, 25);
  }

  async analyzeServerHealth(metrics: any): Promise<string> {
    const prompt = `
Analyze Discord server health metrics for SquadLink:

${JSON.stringify(metrics, null, 2)}

Provide:
1. Issues detected
2. Optimization suggestions
3. Action items

Keep response under 500 characters.
`;

    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }
}
