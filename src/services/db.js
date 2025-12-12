// Re-export API functions for backward compatibility
// Frontend now uses API endpoints instead of direct MongoDB connection
export {
  getRestaurant,
  saveRestaurant,
  getDishes,
  getDish,
  createDish,
  updateDish,
  deleteDish,
  getBills,
  createBill,
} from './api.js';
