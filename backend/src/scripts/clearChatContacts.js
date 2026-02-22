import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Import ChatContact model
import ChatContact from '../app/models/ChatContact.js';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel_booking');
    console.log('MongoDB connected for clearing chat contacts');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const clearChatContacts = async () => {
  try {
    console.log('Clearing chat contacts...');
    
    // Clear existing contacts - no dummy data
    await ChatContact.deleteMany({});
    console.log('Cleared all existing chat contacts');

    console.log('Chat contacts cleared successfully - no dummy data added');
    
  } catch (error) {
    console.error('Error clearing chat contacts:', error);
  }
};

const runScript = async () => {
  try {
    await connectDB();
    await clearChatContacts();
    process.exit(0);
  } catch (error) {
    console.error('Error in clearing process:', error);
    process.exit(1);
  }
};

// Run the script
runScript();
