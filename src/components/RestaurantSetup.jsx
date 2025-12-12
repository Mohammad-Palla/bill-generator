import { useState, useEffect } from 'react';
import { saveRestaurant } from '../services/db';
import { useRestaurant } from '../context/RestaurantContext';
import { toast } from 'react-toastify';

export default function RestaurantSetup() {
  const { restaurant, updateRestaurant } = useRestaurant();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    gstNumber: '',
    cgstRate: 2.5,
    sgstRate: 2.5,
    billFooter: '',
    logo: ''
  });
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || '',
        address: restaurant.address || '',
        phone: restaurant.phone || '',
        gstNumber: restaurant.gstNumber || '',
        cgstRate: restaurant.cgstRate || 2.5,
        sgstRate: restaurant.sgstRate || 2.5,
        billFooter: restaurant.billFooter || '',
        logo: restaurant.logo || ''
      });
      setLogoPreview(restaurant.logo || '');
    }
  }, [restaurant]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500000) { // 500KB limit
        toast.error('Logo size should be less than 500KB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData(prev => ({ ...prev, logo: base64String }));
        setLogoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const savedRestaurant = await saveRestaurant(formData);
      updateRestaurant(savedRestaurant);
      toast.success('Restaurant settings saved successfully!');
    } catch (error) {
      console.error('Failed to save restaurant:', error);
      toast.error('Failed to save restaurant settings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="restaurant-setup">
      <h2>Restaurant Setup</h2>
      <form onSubmit={handleSubmit} className="setup-form">
        <div className="form-group">
          <label>Restaurant Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="Enter restaurant name"
          />
        </div>

        <div className="form-group">
          <label>Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
          />
          {logoPreview && (
            <div className="logo-preview">
              <img src={logoPreview} alt="Logo preview" />
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Address *</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
            placeholder="Enter restaurant address"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter phone number"
          />
        </div>

        <div className="form-group">
          <label>GST Number</label>
          <input
            type="text"
            name="gstNumber"
            value={formData.gstNumber}
            onChange={handleInputChange}
            placeholder="Enter GST number"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>CGST Rate (%) *</label>
            <input
              type="number"
              name="cgstRate"
              value={formData.cgstRate}
              onChange={handleInputChange}
              required
              min="0"
              max="100"
              step="0.1"
            />
          </div>

          <div className="form-group">
            <label>SGST Rate (%) *</label>
            <input
              type="number"
              name="sgstRate"
              value={formData.sgstRate}
              onChange={handleInputChange}
              required
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Bill Footer</label>
          <textarea
            name="billFooter"
            value={formData.billFooter}
            onChange={handleInputChange}
            placeholder="Thank you. Please visit again"
            rows="2"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}

