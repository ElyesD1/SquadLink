import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

const SUMMONER_PUUID = '3j9qB9W4J2O1lqoIxrLmuPsJimsbYYLxE2Suicp4Du1QgdyUjqNJVgw122nbjGz-GnBy6U5ef0yz1w';

async function searchSummonerMatches() {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(mongoUri);

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const matchesCollection = db.collection('matches');

    // Search for exact match
    console.log(`\n🔍 Searching for exact PUUID: ${SUMMONER_PUUID}`);
    const exactMatches = await matchesCollection.find({
      'participants.puuid': SUMMONER_PUUID
    }).limit(5).toArray();
    
    console.log(`📊 Found ${exactMatches.length} matches with exact PUUID`);

    // Search for partial match (first part of PUUID)
    const partialPuuid = SUMMONER_PUUID.substring(0, 20);
    console.log(`\n🔍 Searching for partial PUUID: ${partialPuuid}*`);
    const partialMatches = await matchesCollection.find({
      'participants.puuid': { $regex: `^${partialPuuid}` }
    }).limit(5).toArray();
    
    console.log(`📊 Found ${partialMatches.length} matches with partial PUUID`);

    // List all unique PUUIDs that start with the partial string
    console.log(`\n🔍 Looking for all PUUIDs starting with: ${partialPuuid}`);
    const allMatches = await matchesCollection.aggregate([
      { $unwind: '$participants' },
      { $match: { 'participants.puuid': { $regex: `^${partialPuuid}` } } },
      { $group: { _id: '$participants.puuid', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    console.log(`\n📋 Found ${allMatches.length} unique PUUIDs:`);
    allMatches.forEach((item) => {
      console.log(`  - ${item._id} (${item.count} matches)`);
    });

    // Also check the user profile collection
    const usersCollection = db.collection('users');
    console.log(`\n🔍 Checking users collection for this PUUID...`);
    const user = await usersCollection.findOne({
      'lolAccount.puuid': SUMMONER_PUUID
    });

    if (user) {
      console.log(`✅ Found user profile: ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`   LOL Account: ${user.lolAccount?.gameName}#${user.lolAccount?.tagLine}`);
    } else {
      console.log('❌ No user profile found with this PUUID');
      
      // Search for partial PUUID in users
      const partialUser = await usersCollection.findOne({
        'lolAccount.puuid': { $regex: `^${partialPuuid}` }
      });
      
      if (partialUser) {
        console.log(`✅ Found user with partial PUUID: ${partialUser.lolAccount?.puuid}`);
      }
    }

  } catch (error) {
    console.error('❌ Error searching matches:', error);
    throw error;
  } finally {
    await client.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run the script
searchSummonerMatches()
  .then(() => {
    console.log('\n✨ Search completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Search failed:', error);
    process.exit(1);
  });
