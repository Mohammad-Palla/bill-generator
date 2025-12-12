const API_BASE = import.meta.env.VITE_API_BASE || '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Restaurant API
export async function getRestaurant() {
  return request('/restaurant');
}

export async function saveRestaurant(restaurantData) {
  return request('/restaurant', {
    method: 'POST',
    body: restaurantData,
  });
}

// Dishes API
export async function getDishes() {
  return request('/dishes');
}

export async function getDish(id) {
  return request(`/dishes?id=${id}`);
}

export async function createDish(dishData) {
  return request('/dishes', {
    method: 'POST',
    body: dishData,
  });
}

export async function updateDish(id, dishData) {
  return request(`/dishes?id=${id}`, {
    method: 'PUT',
    body: dishData,
  });
}

export async function deleteDish(id) {
  return request(`/dishes?id=${id}`, {
    method: 'DELETE',
  });
}

// Bills API
export async function getBills() {
  return request('/bills');
}

export async function createBill(billData) {
  return request('/bills', {
    method: 'POST',
    body: billData,
  });
}

