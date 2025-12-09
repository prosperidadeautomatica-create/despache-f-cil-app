/**
 * Seed script to create a demo client
 * Run with: ts-node src/scripts/seed-demo-client.ts
 */
import * as admin from 'firebase-admin';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../../.env') });

async function seedDemoClient() {
  try {
    // Initialize Firebase Admin
    const credentialsPath = process.env.FIREBASE_CREDENTIALS_PATH || './serviceAccountKey.json';

    if (credentialsPath) {
      const serviceAccount = require(resolve(process.cwd(), credentialsPath));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    } else {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }

    const db = admin.firestore();

    // Check if demo client already exists
    const existingClient = await db
      .collection('clients')
      .where('email', '==', 'demo@easydispatch.com')
      .limit(1)
      .get();

    if (!existingClient.empty) {
      console.log('Demo client already exists');
      process.exit(0);
    }

    // Create demo client
    const passwordHash = await bcrypt.hash('demo123', 10);
    const clientData = {
      email: 'demo@easydispatch.com',
      name: 'Demo Client',
      passwordHash,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('clients').add(clientData);
    console.log(`Demo client created with ID: ${docRef.id}`);
    console.log('Email: demo@easydispatch.com');
    console.log('Password: demo123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding demo client:', error);
    process.exit(1);
  }
}

seedDemoClient();

