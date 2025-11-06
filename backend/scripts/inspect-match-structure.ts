import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

const SUMMONER_PUUID = '3j9qB9W4J2O1lqoIxrLmuPsJimsbYYLxE2Suicp4Du1QgdyUjqNJVgw122nbjGz-GnBy6U5ef0yz1w';

async function inspectMatches() {
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

    // Get total count first
    const totalMatches = await matchesCollection.countDocuments({});
    console.log(`\n📊 Total matches in database: ${totalMatches}`);

    // Get one match to see its structure
    console.log('\n📋 Fetching a sample match to inspect structure...');
    const sampleMatch = await matchesCollection.findOne({});
    
    if (sampleMatch) {
      console.log('\n🔍 Sample match structure:');
      console.log('  Keys:', Object.keys(sampleMatch));
      console.log('  Match ID:', sampleMatch.matchId || sampleMatch._id);
      console.log('  PUUID:', sampleMatch.puuid);
      console.log('\n  Full document (first 2000 chars):');
      console.log(JSON.stringify(sampleMatch, null, 2).substring(0, 2000));
    } else {
      console.log('❌ No matches found in database');
      return;
    }

    // Now search for matches by PUUID field (not participants.puuid)
    console.log(`\n🔍 Searching for matches where puuid field = ${SUMMONER_PUUID}`);
    const matchCount = await matchesCollection.countDocuments({
      puuid: SUMMONER_PUUID
    });
    
    console.log(`📊 Found ${matchCount} matches for this PUUID`);

    if (matchCount > 0) {
      // Get a few sample match IDs
      const samples = await matchesCollection.find({ puuid: SUMMONER_PUUID })
        .limit(5)
        .toArray();
      
      console.log('\n📝 Sample Match IDs:');
      samples.forEach((match, idx) => {
        console.log(`  ${idx + 1}. ${match.matchId}`);
      });
    }

  } catch (error) {
    console.error('❌ Error inspecting matches:', error);
    throw error;
  } finally {
    await client.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run the script
inspectMatches()
  .then(() => {
    console.log('\n✨ Inspection completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Inspection failed:', error);
    process.exit(1);
  });
