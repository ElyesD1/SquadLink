# 🎤 Discord Voice Integration - How It Works

## 📋 Important: Understanding Discord Voice Channels

**Discord API Limitation:**
- Discord's API **cannot automatically move users to voice channels** unless they're already connected to voice
- The OAuth flow only adds users to the Discord server, not to voice channels
- This is a Discord security/privacy feature - users must manually join voice

## ✅ How Our Integration Works:

### Step 1: Party Creation
1. User creates a party
2. **Backend automatically creates a Discord voice channel**
3. Voice channel invite link is saved to the party

### Step 2: First-Time Discord Setup (One-Time)
1. User clicks **"Connect Discord Account"** button
2. OAuth redirects to Discord authorization
3. User authorizes the app
4. **User is added to SquadLink Discord server**
5. Success message shows: "Now click 'Join Voice Channel Now' button"

### Step 3: Joining Voice Channel
1. User sees prominent **"Join Voice Channel Now"** button (big green button at top)
2. Clicking this button:
   - Opens Discord app (desktop/web)
   - **Automatically connects to the party's voice channel**
   - User is now in voice chat with party members!

## 🎯 User Flow:

```
Create Party
    ↓
Voice channel auto-created (backend)
    ↓
[First time only] Click "Connect Discord Account"
    ↓
Authorize on Discord → Added to server
    ↓
Click "Join Voice Channel Now" (big green button)
    ↓
Discord opens → Auto-connects to voice channel
    ↓
🎉 In voice chat with team!
```

## 🔄 Workflow for Different Scenarios:

### New User (Never connected Discord):
1. ✅ Click "Connect Discord Account" → OAuth → Join server
2. ✅ Click "Join Voice Channel Now" → Opens Discord voice

### Returning User (Already in Discord server):
1. ✅ Just click "Join Voice Channel Now" → Opens Discord voice
2. ⏭️ Skip the "Connect Discord Account" step

### Party Member:
1. ✅ See the big green "Join Voice Channel Now" button at the top
2. ✅ Click it → Discord opens and connects to voice
3. ✅ All party members who click join the same voice channel

## 🎨 UI Design:

### Voice Channel Card (Top - Purple gradient):
- **Big Green Button**: "Join Voice Channel Now"
- **Primary action** - most prominent
- **Description**: "Opens Discord and connects you to the voice channel"

### Discord Connection Card (Bottom - Blue gradient):
- **Smaller Button**: "Connect Discord Account"
- **Secondary action** - only needed once
- **Description**: "First time setup to join our Discord server"

## 📝 Technical Details:

### Why can't we auto-move users?

Discord API has these restrictions:
1. **`channel_id` in guild member add**: Only works if user is already in a voice channel
2. **Move member endpoint**: Requires user to be connected to voice first
3. **Privacy/Security**: Discord doesn't allow apps to force users into voice

### Our Solution:

Instead of trying to move users (impossible), we:
1. ✅ Create a **voice channel invite link** with the channel ID embedded
2. ✅ Make the link open Discord directly to the voice channel
3. ✅ One click → User is in voice (much better UX!)

### Invite Link Settings:
```javascript
{
  max_age: 86400,      // 24 hours (matches party duration)
  max_uses: 0,         // Unlimited uses for all party members
  unique: true,        // Unique link per party
  target_type: 1       // Voice channel activity
}
```

## 🚀 Benefits of This Approach:

### ✅ Better Than Auto-Move:
- **User Control**: Users choose when to join voice (respects privacy)
- **Works Always**: No dependencies on voice connection state
- **One Click**: Simple, clear action
- **Persistent**: Link works anytime, users can rejoin easily

### ✅ User Experience:
- Clear visual hierarchy (voice channel button is biggest)
- Obvious what each button does
- Works on desktop and web Discord
- No confusion about "why wasn't I moved?"

## 🎮 Party Voice Management:

### Created When:
- ✅ Party is created (automatic)
- ✅ Named: `🎮 {PartyName}`
- ✅ Stored in party document

### Accessed By:
- ✅ All party members
- ✅ Via the green "Join Voice Channel Now" button
- ✅ Link works for 24 hours (party duration)

### Not Shown To:
- ❌ Users not in the party
- ❌ People viewing "Available Parties"
- ❌ Outsiders (only members see Discord integration)

## 📊 Current Implementation:

### Backend:
```typescript
// Auto-create voice channel on party creation
const voiceChannel = await this.discordService.createVoiceChannelForParty(
  savedParty._id.toString(),
  savedParty.name,
);

// Save to party
savedParty.discordVoiceChannel = {
  channelId: voiceChannel.channelId,
  channelName: voiceChannel.channelName,
  inviteUrl: voiceChannel.inviteUrl,
  createdAt: new Date(),
};
```

### Frontend:
```tsx
{/* Big green button - primary action */}
<Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-base py-6">
  <Users className="w-5 h-5 mr-2" />
  Join Voice Channel Now
</Button>
```

## 🔧 Troubleshooting:

### "Voice channel link doesn't work"
- Make sure Discord app is installed (desktop or web)
- Link opens Discord automatically
- If web Discord, may need to allow pop-ups

### "I'm not seeing the voice channel button"
- Make sure you're a party member (check "My Parties")
- Voice channel is auto-created, should appear immediately
- Refresh the page if needed

### "Other members can't join"
- Share the party invite code
- They join the party first
- Then they see the voice channel button
- Link works for all party members

## 🎉 Success Indicators:

### User knows it worked when:
1. ✅ Sees "Successfully connected to Discord!" message
2. ✅ Sees big green "Join Voice Channel Now" button
3. ✅ Clicks button → Discord opens to voice channel
4. ✅ Can talk to party members in voice!

---

**Bottom Line:** Discord doesn't support auto-moving users to voice for security reasons. Our solution is actually **better** - users get a big, clear button that opens Discord directly to the voice channel. One click, and they're in! 🚀
