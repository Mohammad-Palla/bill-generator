import { connectDB } from './db.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const database = await connectDB();

    if (req.method === 'GET') {
      // Get all bills
      const bills = await database.collection('bills').find({}).sort({ createdAt: -1 }).toArray();
      res.status(200).json(bills);
    } else if (req.method === 'POST') {
      // Create bill
      const billData = {
        ...req.body,
        date: new Date(),
        createdAt: new Date()
      };
      const result = await database.collection('bills').insertOne(billData);
      const created = await database.collection('bills').findOne({ _id: result.insertedId });
      res.status(201).json(created);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}

