import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

const SUMMONER_PUUID = '3j9qB9W4J2O1lqoIxrLmuPsJimsbYYLxE2Suicp4Du1QgdyUjqNJVgw122nbjGz-GnBy6U5ef0yz1w';

async function deleteSummonerMatches() {
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
    const matchesCollection = db.collection('matchcaches');

    // First, count how many matches will be deleted
    console.log(`\n🔍 Searching for matches with PUUID: ${SUMMONER_PUUID}`);
    
    const countResult = await matchesCollection.countDocuments({
      puuid: SUMMONER_PUUID
    });

    console.log(`📊 Found ${countResult} matches for this summoner`);

    if (countResult === 0) {
      console.log('✨ No matches found to delete');
      return;
    }

    // Ask for confirmation (in a script context, we'll just proceed)
    console.log(`\n⚠️  About to delete ${countResult} matches...`);
    
    // Delete the matches
    const deleteResult = await matchesCollection.deleteMany({
      puuid: SUMMONER_PUUID
    });

    console.log(`\n✅ Successfully deleted ${deleteResult.deletedCount} matches`);
    console.log('🎉 Cleanup complete!');

  } catch (error) {
    console.error('❌ Error deleting matches:', error);
    throw error;
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the script
deleteSummonerMatches()
  .then(() => {
    console.log('\n✨ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
