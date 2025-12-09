import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { Quote } from '../quotes/interfaces/quote.interface';
import { Client } from './interfaces/client.interface';

@Injectable()
export class FirestoreService implements OnModuleInit {
  private db: admin.firestore.Firestore;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      const credentialsPath = this.configService.get<string>(
        'FIREBASE_CREDENTIALS_PATH',
      ) || 'serviceAccountKey.json';

      // Try to use service account file first
      const path = require('path');
      const fs = require('fs');
      const fullPath = path.resolve(process.cwd(), credentialsPath);
      
      if (fs.existsSync(fullPath)) {
        // Initialize with service account file
        const serviceAccount = require(fullPath);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id || this.configService.get<string>('FIREBASE_PROJECT_ID'),
        });
        console.log(`Firestore initialized with service account file: ${fullPath}`);
      } else {
        // Fallback to environment variables
        const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
        const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
        const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

        if (!projectId || !clientEmail || !privateKey) {
          throw new Error(
            `Firebase credentials file not found at ${fullPath} and environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) are not set. Please provide either a service account file or environment variables.`
          );
        }

        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
          }),
        });
        console.log('Firestore initialized with environment variables');
      }

      this.db = admin.firestore();
      console.log('Firestore initialized successfully');
    } catch (error) {
      console.error('Error initializing Firestore:', error);
      throw error;
    }
  }

  // Client operations
  async getClient(clientId: string): Promise<Client | null> {
    const doc = await this.db.collection('clients').doc(clientId).get();
    if (!doc.exists) {
      return null;
    }
    return { clientId, ...doc.data() } as Client;
  }

  async getClientByEmail(email: string): Promise<Client | null> {
    const snapshot = await this.db
      .collection('clients')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { clientId: doc.id, ...doc.data() } as Client;
  }

  async createClient(client: Omit<Client, 'clientId'>): Promise<string> {
    const docRef = await this.db.collection('clients').add(client);
    return docRef.id;
  }

  // Quote operations
  async createQuote(clientId: string, quote: Quote): Promise<void> {
    await this.db
      .collection('clients')
      .doc(clientId)
      .collection('quotes')
      .doc(quote.quoteId)
      .set(quote);
  }

  async getQuote(clientId: string, quoteId: string): Promise<Quote | null> {
    const doc = await this.db
      .collection('clients')
      .doc(clientId)
      .collection('quotes')
      .doc(quoteId)
      .get();

    if (!doc.exists) {
      return null;
    }

    return doc.data() as Quote;
  }

  async updateQuote(
    clientId: string,
    quoteId: string,
    updates: Partial<Quote>,
  ): Promise<void> {
    await this.db
      .collection('clients')
      .doc(clientId)
      .collection('quotes')
      .doc(quoteId)
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      });
  }

  async getQuotes(
    clientId: string,
    filters?: {
      limit?: number;
      cursor?: string;
      status?: string;
      carrier?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<{ quotes: Quote[]; nextCursor?: string }> {
    let query: admin.firestore.Query = this.db
      .collection('clients')
      .doc(clientId)
      .collection('quotes');

    // Apply filters
    if (filters?.status) {
      query = query.where('status', '==', filters.status);
    }
    if (filters?.carrier) {
      query = query.where('carrier', '==', filters.carrier);
    }
    if (filters?.startDate) {
      query = query.where('createdAt', '>=', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.where('createdAt', '<=', filters.endDate);
    }

    // Order by createdAt descending
    query = query.orderBy('createdAt', 'desc');

    // Apply cursor for pagination
    if (filters?.cursor) {
      const cursorDoc = await this.db
        .collection('clients')
        .doc(clientId)
        .collection('quotes')
        .doc(filters.cursor)
        .get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    // Apply limit
    const limit = filters?.limit || 20;
    query = query.limit(limit + 1); // Get one extra to check if there's more

    const snapshot = await query.get();
    const quotes = snapshot.docs
      .slice(0, limit)
      .map((doc) => doc.data() as Quote);

    const nextCursor =
      snapshot.docs.length > limit
        ? snapshot.docs[limit - 1].id
        : undefined;

    return { quotes, nextCursor };
  }
}

