import { useRestaurant } from "../context/RestaurantContext";

export default function BillPreview({ billItems, tableNumber, billNumber, date, time, waiterName, serviceType }) {
  const { restaurant } = useRestaurant();

  if (!restaurant) {
    return (
      <div className="bill-preview-empty">
        Please set up your restaurant first
      </div>
    );
  }

  // Calculate totals
  const subtotal = billItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const cgst = (subtotal * (restaurant.cgstRate || 2.5)) / 100;
  const sgst = (subtotal * (restaurant.sgstRate || 2.5)) / 100;
  const total = subtotal + cgst + sgst;

  const dateStr = date || new Date().toLocaleDateString("en-IN", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  });
  const timeStr = time || new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="bill-preview">
      <div className="bill-content">
        {/* Header */}
        <div className="bill-header">
          {restaurant.logo && (
            <div className="bill-logo">
              <img src={restaurant.logo} alt={restaurant.name} />
            </div>
          )}
          <h2 className="bill-restaurant-name">
            {restaurant.name || "Restaurant Name"}
          </h2>
          {restaurant.address && (
            <p className="bill-address">{restaurant.address}</p>
          )}
          {restaurant.phone && <p className="bill-phone">{restaurant.phone}</p>}
        </div>

        {/* Bill Info */}
        <div className="bill-info">
          <div className="bill-info-row centered">
            <span>{dateStr} {timeStr}</span>
          </div>
          {(tableNumber || billNumber || waiterName) && (
            <div className="bill-info-row aligned">
              {tableNumber && <span>Table {tableNumber}</span>}
              {billNumber && <span>{billNumber}</span>}
              {waiterName && <span>{waiterName}</span>}
            </div>
          )}
          {serviceType && (
            <div className="bill-info-row centered">
              <span>**** {serviceType} ****</span>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="bill-items">
          <div className="bill-items-header">
            <span>Dish</span>
            <span>Quantity</span>
            <span>Price</span>
          </div>
          {billItems.length === 0 ? (
            <div className="bill-empty">No items added</div>
          ) : (
            billItems.map((item, index) => (
              <div key={index} className="bill-item">
                <span className="item-name">{item.name}</span>
                <span className="item-qty">{item.quantity}</span>
                <span className="item-price">
                  ₹{parseFloat(item.price).toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Totals */}
        {billItems.length > 0 && (
          <div className="bill-totals">
            <div className="bill-total-row">
              <span>Amount:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="bill-total-row">
              <span>SGST ({restaurant.sgstRate || 2.5}%):</span>
              <span>₹{sgst.toFixed(2)}</span>
            </div>
            <div className="bill-total-row">
              <span>CGST ({restaurant.cgstRate || 2.5}%):</span>
              <span>₹{cgst.toFixed(2)}</span>
            </div>
            <div className="bill-total-row total">
              <span>Total Amount:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Footer */}
        {restaurant.gstNumber && (
          <div className="bill-gst">
            <p>GST Number: {restaurant.gstNumber}</p>
          </div>
        )}
        {restaurant.sacCode && (
          <div className="bill-gst">
            <p>SAC CODE: {restaurant.sacCode}</p>
          </div>
        )}
        {restaurant.billFooter && (
          <div className="bill-footer">
            <p>{restaurant.billFooter}</p>
          </div>
        )}
      </div>
    </div>
  );
}
