import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RestaurantProvider } from './context/RestaurantContext';
import Layout from './components/Layout';
import SetupPage from './pages/SetupPage';
import DishesPage from './pages/DishesPage';
import CreateBillPage from './pages/CreateBillPage';
import './App.css';

function App() {
  return (
    <RestaurantProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<SetupPage />} />
            <Route path="/dishes" element={<DishesPage />} />
            <Route path="/create-bill" element={<CreateBillPage />} />
          </Routes>
        </Layout>
      </Router>
    </RestaurantProvider>
  );
}

export default App;
