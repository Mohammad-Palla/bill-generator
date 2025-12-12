import { connectDB } from './db.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const database = await connectDB();

    if (req.method === 'GET') {
      // Get restaurant
      const restaurant = await database.collection('restaurants').findOne({});
      res.status(200).json(restaurant || null);
    } else if (req.method === 'POST' || req.method === 'PUT') {
      // Save/Update restaurant
      const restaurantData = req.body;
      const existing = await database.collection('restaurants').findOne({});

      if (existing) {
        // Update existing restaurant
        await database.collection('restaurants').updateOne(
          { _id: existing._id },
          {
            $set: {
              ...restaurantData,
              updatedAt: new Date()
            }
          }
        );
        const updated = await database.collection('restaurants').findOne({ _id: existing._id });
        res.status(200).json(updated);
      } else {
        // Create new restaurant
        const newRestaurant = {
          ...restaurantData,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const result = await database.collection('restaurants').insertOne(newRestaurant);
        const created = await database.collection('restaurants').findOne({ _id: result.insertedId });
        res.status(201).json(created);
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}

// Express middleware wrapper
export function expressHandler(req, res) {
  handler(req, res).catch(err => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: err.message });
  });
}
