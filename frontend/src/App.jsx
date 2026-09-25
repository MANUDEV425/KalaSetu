import { Routes, Route } from 'react-router-dom';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ProductDetails from './pages/ProductDetails';
import ArtisanProfile from './pages/ArtisanProfile';

import Marketplace from './pages/Marketplace';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import PlaceholderPage from './pages/PlaceholderPage';

export default function App() {
  return (
    <div className="min-h-screen bg-kala-50">

      <Navbar />

      <main className="pb-16">

        <Routes>

          {/* =====================================
              PUBLIC ROUTES
          ====================================== */}

          <Route
            path="/"
            element={<Marketplace />}
          />

          <Route
            path="/login"
            element={<Login />}
          />
          <Route
  path="/artisans/:id"
  element={<ArtisanProfile />}
/>
          


          <Route
            path="/signup"
            element={<Signup />}
          />


          {/* =====================================
              ARTISAN ROUTES
          ====================================== */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireRole="artisan">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
  path="/marketplace/:id"
  element={<ProductDetails />}
/>

          <Route
            path="/profile"
            element={
              <ProtectedRoute requireRole="artisan">
                <Profile />
              </ProtectedRoute>
            }
          />


          {/* =====================================
              PHASE 2 PLACEHOLDER ROUTES
          ====================================== */}

         <Route
  path="/products"
  element={
    <ProtectedRoute requireRole="artisan">
      <Products />
    </ProtectedRoute>
  }
/>
<Route
  path="/products/new"
  element={
    <ProtectedRoute requireRole="artisan">
      <ProductForm />
    </ProtectedRoute>
  }
/>

<Route
  path="/products/:id/edit"
  element={
    <ProtectedRoute requireRole="artisan">
      <ProductForm />
    </ProtectedRoute>
  }
/>
          <Route
            path="/orders"
            element={
              <ProtectedRoute requireRole="artisan">
                <PlaceholderPage
                  title="Orders"
                  icon="🛍️"
                  description="Order management will be available in a later phase."
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute requireRole="artisan">
                <PlaceholderPage
                  title="Analytics"
                  icon="📊"
                  description="Your product performance and analytics will be available in a later phase."
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai-marketing"
            element={
              <ProtectedRoute requireRole="artisan">
                <PlaceholderPage
                  title="AI Marketing"
                  icon="📣"
                  description="AI-powered marketing tools will be introduced in a later phase."
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai-business-advisor"
            element={
              <ProtectedRoute requireRole="artisan">
                <PlaceholderPage
                  title="AI Business Advisor"
                  icon="✨"
                  description="Your AI business advisor will be introduced in a later phase."
                />
              </ProtectedRoute>
            }
          />

        </Routes>

      </main>

    </div>
  );
}