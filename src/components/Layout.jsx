import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="app-layout">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>Bill Generator</h1>
        </div>
        <div className="nav-links">
          <Link
            to="/"
            className={location.pathname === '/' ? 'active' : ''}
          >
            Setup
          </Link>
          <Link
            to="/dishes"
            className={location.pathname === '/dishes' ? 'active' : ''}
          >
            Dishes
          </Link>
          <Link
            to="/create-bill"
            className={location.pathname === '/create-bill' ? 'active' : ''}
          >
            Create Bill
          </Link>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

