// connect.js
import { MongoClient } from 'mongodb';
let client = null;
export async function connectToMongoDB(uri) {
    try {
         client = new MongoClient(uri);
        await client.connect();
        console.log('Connected to MongoDB');
        return client.db(); // Return the database instance
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}
export async function Disconnected() {
    try {
        await client.close();
        console.log('Disconnected to MongoDB');// Return the database instance
    } catch (error) {
        console.error('Error Disconnected to MongoDB:', error);
        throw error;
    }
}
