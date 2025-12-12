import { useState, useEffect } from 'react';
import { getDishes, createDish, updateDish, deleteDish } from '../services/db';
import { toast } from 'react-toastify';

export default function DishManagement() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: ''
  });

  useEffect(() => {
    loadDishes();
  }, []);

  const loadDishes = async () => {
    try {
      setLoading(true);
      const data = await getDishes();
      setDishes(data);
    } catch (error) {
      console.error('Failed to load dishes:', error);
      toast.error('Failed to load dishes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenModal = (dish = null) => {
    if (dish) {
      setEditingDish(dish);
      setFormData({
        name: dish.name || '',
        price: dish.price || '',
        description: dish.description || '',
        category: dish.category || ''
      });
    } else {
      setEditingDish(null);
      setFormData({
        name: '',
        price: '',
        description: '',
        category: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDish(null);
    setFormData({
      name: '',
      price: '',
      description: '',
      category: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDish) {
        await updateDish(editingDish._id, formData);
        toast.success('Dish updated successfully!');
      } else {
        await createDish(formData);
        toast.success('Dish created successfully!');
      }
      handleCloseModal();
      loadDishes();
    } catch (error) {
      console.error('Failed to save dish:', error);
      toast.error('Failed to save dish: ' + error.message);
    }
  };

  const handleDelete = async (dishId) => {
    if (!window.confirm('Are you sure you want to delete this dish?')) {
      return;
    }
    try {
      await deleteDish(dishId);
      toast.success('Dish deleted successfully!');
      loadDishes();
    } catch (error) {
      console.error('Failed to delete dish:', error);
      toast.error('Failed to delete dish: ' + error.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading dishes...</div>;
  }

  return (
    <div className="dish-management">
      <div className="page-header">
        <h2>Dish Management</h2>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          + Add Dish
        </button>
      </div>

      {dishes.length === 0 ? (
        <div className="empty-state">
          <p>No dishes found. Add your first dish to get started!</p>
        </div>
      ) : (
        <div className="dishes-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dishes.map(dish => (
                <tr key={dish._id}>
                  <td>{dish.name}</td>
                  <td>{dish.category || '-'}</td>
                  <td>₹{parseFloat(dish.price).toFixed(2)}</td>
                  <td>{dish.description || '-'}</td>
                  <td>
                    <button
                      onClick={() => handleOpenModal(dish)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(dish._id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingDish ? 'Edit Dish' : 'Add New Dish'}</h3>
              <button onClick={handleCloseModal} className="btn-close">×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Dish Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter dish name"
                />
              </div>

              <div className="form-group">
                <label>Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="Enter price"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Main Course, Appetizer"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter dish description"
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingDish ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

