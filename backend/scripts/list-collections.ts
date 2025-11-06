import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

async function listCollections() {
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
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📋 Available collections:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });

    // Check the matches collection specifically
    const matchesCollection = db.collection('matches');
    const totalMatches = await matchesCollection.countDocuments({});
    console.log(`\n📊 Total documents in 'matches' collection: ${totalMatches}`);

    // Get one sample match
    const sample = await matchesCollection.findOne({});
    if (sample) {
      console.log('\n🔍 Sample match document:');
      console.log('  matchId:', sample.matchId);
      console.log('  puuid:', sample.puuid);
      console.log('  Keys:', Object.keys(sample));
    }

    // Try to find the specific PUUID
    const targetPuuid = '3j9qB9W4J2O1lqoIxrLmuPsJimsbYYLxE2Suicp4Du1QgdyUjqNJVgw122nbjGz-GnBy6U5ef0yz1w';
    const found = await matchesCollection.findOne({ puuid: targetPuuid });
    
    if (found) {
      console.log('\n✅ Found match with target PUUID!');
      console.log('  matchId:', found.matchId);
    } else {
      console.log('\n❌ No match found with that exact PUUID');
      
      // Try searching all PUUIDs
      const allPuuids = await matchesCollection.distinct('puuid');
      console.log(`\n📋 Total unique PUUIDs: ${allPuuids.length}`);
      console.log('First 5 PUUIDs:');
      allPuuids.slice(0, 5).forEach((p: string) => console.log(`  - ${p}`));
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await client.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run the script
listCollections()
  .then(() => {
    console.log('\n✨ Inspection completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Inspection failed:', error);
    process.exit(1);
  });
