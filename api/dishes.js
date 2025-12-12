import { connectDB } from './db.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const database = await connectDB();
    const { id } = req.query;

    if (req.method === 'GET') {
      if (id) {
        // Get single dish
        const dish = await database.collection('dishes').findOne({ _id: new ObjectId(id) });
        if (!dish) {
          return res.status(404).json({ error: 'Dish not found' });
        }
        res.status(200).json(dish);
      } else {
        // Get all dishes
        const dishes = await database.collection('dishes').find({}).sort({ createdAt: -1 }).toArray();
        res.status(200).json(dishes);
      }
    } else if (req.method === 'POST') {
      // Create dish
      const dishData = {
        ...req.body,
        price: parseFloat(req.body.price),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await database.collection('dishes').insertOne(dishData);
      const created = await database.collection('dishes').findOne({ _id: result.insertedId });
      res.status(201).json(created);
    } else if (req.method === 'PUT') {
      // Update dish
      if (!id) {
        return res.status(400).json({ error: 'Dish ID is required' });
      }
      const updateData = {
        ...req.body,
        price: parseFloat(req.body.price),
        updatedAt: new Date()
      };
      const result = await database.collection('dishes').updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Dish not found' });
      }
      const updated = await database.collection('dishes').findOne({ _id: new ObjectId(id) });
      res.status(200).json(updated);
    } else if (req.method === 'DELETE') {
      // Delete dish
      if (!id) {
        return res.status(400).json({ error: 'Dish ID is required' });
      }
      const result = await database.collection('dishes').deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Dish not found' });
      }
      res.status(200).json({ success: true });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}

