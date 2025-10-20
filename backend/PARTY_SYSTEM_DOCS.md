# Party System Backend Implementation

## Overview
Complete real-time party/squad system for League of Legends with WebSocket integration, CRUD operations, and join request handling.

## Features Implemented

### 🎮 **Party Entity** (`party/entities/party.entity.ts`)
- **Game Modes**: ARAM, Ranked Flex, Draft Pick, Ranked Solo/Duo
- **Player Limits**: Solo/Duo (2 players), Others (5 players)
- **Party Status**: Open, In Game, Closed
- **Member Management**: Creator, members with ready status, LoL account integration
- **Join Requests**: Pending requests with user info and optional messages
- **Advanced Features**: Private parties with invite codes, scheduling, preferences, auto-expiry

### 📝 **DTOs** (`party/dto/party.dto.ts`)
- `CreatePartyDto`: Create new parties with validation
- `UpdatePartyDto`: Update party details
- `JoinPartyRequestDto`: Request to join with optional message
- `HandleJoinRequestDto`: Accept/reject join requests
- `PartyFiltersDto`: Search and filter parties
- `KickMemberDto`, `UpdateMemberStatusDto`: Member management

### 🔧 **Party Service** (`party/party.service.ts`)
- **CRUD Operations**: Create, read, update, delete parties
- **Member Management**: Join, leave, kick members
- **Join Requests**: Send, accept, reject requests
- **Validation**: Game mode constraints, party limits, permissions
- **Real-time Integration**: WebSocket notifications for all actions
- **Cleanup**: Automatic expired party removal

### 🌐 **REST API** (`party/party.controller.ts`)
- `POST /party` - Create party
- `GET /party` - List parties with filters
- `GET /party/my-parties` - User's parties
- `GET /party/my-active-party` - Current active party
- `GET /party/:id` - Get specific party
- `PUT /party/:id` - Update party
- `DELETE /party/:id` - Delete party
- `POST /party/:id/request-join` - Request to join
- `POST /party/:id/handle-request` - Accept/reject requests
- `POST /party/:id/leave` - Leave party
- `POST /party/:id/kick` - Kick member
- `PUT /party/:id/member-status` - Update ready status

### ⚡ **WebSocket Gateway** (`party/party.gateway.ts`)
- **Real-time Updates**: Party changes, member updates, join requests
- **Notifications**: Join requests, accepts/rejects, kicks
- **Party Rooms**: Users join party-specific rooms
- **Global Updates**: Party list changes for all users
- **Authentication**: JWT token validation for WebSocket connections
- **Events**:
  - `party:update` - Party state changes
  - `parties:update` - Global party list updates
  - `notification` - User-specific notifications
  - `party:join-room` - Join party room
  - `party:request-join` - Real-time join requests
  - `party:handle-request` - Real-time request handling
  - `party:update-status` - Member ready status
  - `party:typing` - Typing indicators

### 🔄 **Cleanup Service** (`party/party-cleanup.service.ts`)
- Automatic hourly cleanup of expired parties
- Prevents database bloat
- Configurable via cron expressions

### 👥 **User Integration** (`users/entities/user.entity.ts`)
- Added party tracking fields to User entity
- `currentPartyId`: Active party reference
- `partyHistory`: Historical party participation
- `totalPartiesJoined`, `totalPartiesCreated`: Statistics

## Real-time Flow Examples

### 🎯 **Creating a Party**
1. User creates party via REST API
2. Party saved to database
3. WebSocket broadcasts to all users: `parties:update` with `party_created`
4. Party appears in real-time on all clients

### 🤝 **Join Request Flow**
1. User requests to join via WebSocket: `party:request-join`
2. Request saved to party document
3. Party creator receives notification: `notification` with join request details
4. All party room members get update: `party:update` with `join_request`
5. Creator accepts/rejects via WebSocket: `party:handle-request`
6. Requester gets notification of result
7. If accepted, user joins party room and all members get `member_joined` update

### 💬 **Real-time Party Updates**
- Member ready status changes broadcast instantly
- Typing indicators during party chat
- Member joins/leaves update all connected clients
- Party settings changes notify all members

## WebSocket Namespaces & Rooms

### 📡 **Namespace**: `/party`
- **Global Room**: `global:parties` - All users receive party list updates
- **Party Rooms**: `party:{partyId}` - Members of specific parties
- **Authentication**: Required via JWT token in handshake

### 🔐 **Security Features**
- JWT authentication for all API endpoints
- WebSocket authentication on connection
- Permission validation (only creators can update/delete)
- User authorization for party room access
- Input validation on all endpoints

## Game Mode Constraints

| Game Mode | Max Players | Description |
|-----------|-------------|-------------|
| Ranked Solo/Duo | 2 | Duo queue only |
| ARAM | 5 | All Random All Mid |
| Ranked Flex | 5 | Flexible ranked queue |
| Draft Pick | 5 | Normal draft mode |

## Database Indexes
- Optimized queries with indexes on:
  - `status + gameMode` - Fast party filtering
  - `creatorId` - User's created parties
  - `members.userId` - User's joined parties
  - `createdAt` - Chronological sorting
  - `expiresAt` - TTL for automatic cleanup

## Error Handling
- Comprehensive validation with specific error messages
- WebSocket error events for failed operations
- Graceful disconnection handling
- Automatic cleanup of stale connections

## Usage Examples

### Creating a Party
```typescript
POST /party
{
  "name": "Ranked Climb Squad",
  "gameMode": "ranked_flex",
  "description": "Looking for Gold+ players",
  "preferences": {
    "minRank": "Gold",
    "voiceChat": true,
    "language": "English"
  }
}
```

### WebSocket Connection
```javascript
const socket = io('/party', {
  auth: { token: 'jwt-token-here' }
});

socket.on('party:update', (data) => {
  console.log('Party update:', data);
});

socket.on('notification', (notification) => {
  console.log('New notification:', notification);
});
```

This implementation provides a complete, production-ready party system with real-time capabilities, comprehensive error handling, and scalable architecture.