import { useState, useEffect } from 'react';
import { getDishes, createBill } from '../services/db';
import { useRestaurant } from '../context/RestaurantContext';
import BillPreview from './BillPreview';
import { generateBillPDF } from '../utils/pdfGenerator';
import { toast } from 'react-toastify';

export default function BillCreator() {
  const { restaurant } = useRestaurant();
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [billItems, setBillItems] = useState([]);
  const [tableNumber, setTableNumber] = useState('');
  const [billNumber, setBillNumber] = useState('');

  useEffect(() => {
    loadDishes();
    generateBillNumber();
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

  const generateBillNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    setBillNumber(`BILL-${timestamp}-${random}`);
  };

  const filteredDishes = dishes.filter(dish =>
    dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dish.category && dish.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddItem = (dish) => {
    const existingItem = billItems.find(item => item.dishId === dish._id.toString());
    
    if (existingItem) {
      setBillItems(billItems.map(item =>
        item.dishId === dish._id.toString()
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setBillItems([...billItems, {
        dishId: dish._id.toString(),
        name: dish.name,
        price: parseFloat(dish.price),
        quantity: 1
      }]);
    }
    toast.success(`${dish.name} added to bill`);
  };

  const handleUpdateQuantity = (dishId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(dishId);
      return;
    }
    setBillItems(billItems.map(item =>
      item.dishId === dishId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const handleRemoveItem = (dishId) => {
    setBillItems(billItems.filter(item => item.dishId !== dishId));
  };

  const calculateTotals = () => {
    const subtotal = billItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cgstRate = restaurant?.cgstRate || 2.5;
    const sgstRate = restaurant?.sgstRate || 2.5;
    const cgst = (subtotal * cgstRate) / 100;
    const sgst = (subtotal * sgstRate) / 100;
    const total = subtotal + cgst + sgst;
    return { subtotal, cgst, sgst, total };
  };

  const handlePrint = async () => {
    if (billItems.length === 0) {
      toast.error('Please add items to the bill');
      return;
    }

    if (!tableNumber.trim()) {
      toast.error('Please enter table number');
      return;
    }

    try {
      const { subtotal, cgst, sgst, total } = calculateTotals();
      
      const billData = {
        billNumber,
        tableNumber,
        items: billItems.map(item => ({
          dishId: item.dishId,
          dishName: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal,
        cgst,
        sgst,
        total
      };

      // Save to database
      await createBill(billData);
      
      // Generate PDF
      generateBillPDF(billData, restaurant);
      
      toast.success('Bill generated and saved successfully!');
      
      // Reset bill
      setBillItems([]);
      setTableNumber('');
      generateBillNumber();
    } catch (error) {
      console.error('Failed to create bill:', error);
      toast.error('Failed to create bill: ' + error.message);
    }
  };

  const { subtotal, cgst, sgst, total } = calculateTotals();

  return (
    <div className="bill-creator">
      <div className="bill-creator-container">
        {/* Left Column - Dish Selection */}
        <div className="dish-selection-panel">
          <div className="panel-header">
            <h2>Select Dishes</h2>
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {loading ? (
            <div className="loading">Loading dishes...</div>
          ) : filteredDishes.length === 0 ? (
            <div className="empty-state">
              {searchTerm ? 'No dishes found matching your search' : 'No dishes available. Add dishes first!'}
            </div>
          ) : (
            <div className="dishes-grid">
              {filteredDishes.map(dish => (
                <div key={dish._id} className="dish-card" onClick={() => handleAddItem(dish)}>
                  <div className="dish-name">{dish.name}</div>
                  <div className="dish-price">₹{parseFloat(dish.price).toFixed(2)}</div>
                  {dish.category && (
                    <div className="dish-category">{dish.category}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Middle Column - Bill Items and Calculations */}
        <div className="bill-controls-panel">
          <div className="panel-header">
            <h2>Bill Items</h2>
            <div className="bill-controls">
              <input
                type="text"
                placeholder="Table Number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="table-input"
              />
            </div>
          </div>

          {/* Bill Items List */}
          <div className="bill-items-list">
            {billItems.length === 0 ? (
              <div className="empty-state">No items added</div>
            ) : (
              billItems.map(item => (
                <div key={item.dishId} className="bill-item-row">
                  <div className="item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-price">₹{item.price.toFixed(2)}</span>
                  </div>
                  <div className="item-controls">
                    <button
                      onClick={() => handleUpdateQuantity(item.dishId, item.quantity - 1)}
                      className="qty-btn"
                    >
                      -
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.dishId, item.quantity + 1)}
                      className="qty-btn"
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.dishId)}
                      className="remove-btn"
                    >
                      ×
                    </button>
                  </div>
                  <div className="item-total">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totals Summary */}
          {billItems.length > 0 && (
            <div className="bill-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>CGST ({restaurant?.cgstRate || 2.5}%):</span>
                <span>₹{cgst.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>SGST ({restaurant?.sgstRate || 2.5}%):</span>
                <span>₹{sgst.toFixed(2)}</span>
              </div>
              <div className="summary-row total-row">
                <span>Total:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Print Button */}
          <button
            onClick={handlePrint}
            disabled={billItems.length === 0}
            className="btn-print"
          >
            Print Bill
          </button>
        </div>

        {/* Right Column - Bill Preview */}
        <div className="bill-preview-panel">
          <div className="panel-header">
            <h2>Bill Preview</h2>
          </div>
          <div className="bill-preview-container">
            <BillPreview
              billItems={billItems}
              tableNumber={tableNumber}
              billNumber={billNumber}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
