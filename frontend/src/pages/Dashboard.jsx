import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import MobileArtisanNav from '../components/MobileArtisanNav';

export default function Dashboard() {
  const { user, profile } = useAuth();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    if (user) {
      loadProducts();
    }
  }, [user]);

  async function loadProducts() {
    setLoadingProducts(true);

    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        stock,
        is_published,
        product_images (
          image_url
        )
      `)
      .eq('artisan_id', user.id)
      .order('created_at', {
        ascending: false,
      });

    if (error) {
      console.error(error);
      setProducts([]);
    } else {
      setProducts(data || []);
    }

    setLoadingProducts(false);
  }

  const totalProducts = products.length;

  const publishedProducts = products.filter(
    (product) => product.is_published
  ).length;

  const draftProducts = products.filter(
    (product) => !product.is_published
  ).length;

  const totalStock = products.reduce(
    (total, product) =>
      total + Number(product.stock || 0),
    0
  );

  return (
    <div className="min-h-screen bg-kala-50 pb-20 md:pb-0">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Welcome */}
        <div className="mb-8">

          <p className="text-sm text-gray-500">
            Artisan Dashboard
          </p>

          <h1 className="text-2xl sm:text-3xl font-bold text-kala-700 mt-1">
            Welcome,{' '}
            {profile?.name ||
              profile?.full_name ||
              'Artisan'}
            👋
          </h1>

          <p className="text-gray-500 mt-2">
            Manage your craft, products and marketplace presence.
          </p>

        </div>


        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          {/* Total products */}
          <div className="bg-white rounded-2xl border border-kala-100 shadow-sm p-5">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Total Products
                </p>

                <p className="text-2xl font-bold text-kala-700 mt-1">
                  {loadingProducts
                    ? '...'
                    : totalProducts}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-kala-50 flex items-center justify-center text-xl">
                📦
              </div>

            </div>

          </div>


          {/* Published */}
          <div className="bg-white rounded-2xl border border-kala-100 shadow-sm p-5">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Published
                </p>

                <p className="text-2xl font-bold text-green-600 mt-1">
                  {loadingProducts
                    ? '...'
                    : publishedProducts}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center text-xl">
                ✓
              </div>

            </div>

          </div>


          {/* Drafts */}
          <div className="bg-white rounded-2xl border border-kala-100 shadow-sm p-5">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Drafts
                </p>

                <p className="text-2xl font-bold text-gray-600 mt-1">
                  {loadingProducts
                    ? '...'
                    : draftProducts}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-xl">
                📝
              </div>

            </div>

          </div>


          {/* Stock */}
          <div className="bg-white rounded-2xl border border-kala-100 shadow-sm p-5">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Total Stock
                </p>

                <p className="text-2xl font-bold text-kala-700 mt-1">
                  {loadingProducts
                    ? '...'
                    : totalStock}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-kala-50 flex items-center justify-center text-xl">
                🏺
              </div>

            </div>

          </div>

        </div>


        {/* Quick actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Products */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-kala-100 shadow-sm p-5 sm:p-6">

            <div className="flex items-center justify-between mb-5">

              <div>
                <h2 className="text-lg font-semibold text-kala-700">
                  Your Products
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Recently added products
                </p>
              </div>

              <Link
                to="/products"
                className="text-sm font-medium text-kala-600 hover:text-kala-700"
              >
                View all →
              </Link>

            </div>


            {loadingProducts ? (
              <div className="py-10 text-center text-gray-500">
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <div className="py-10 text-center">

                <div className="text-4xl mb-3">
                  📦
                </div>

                <p className="font-medium text-gray-700">
                  No products yet
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Add your first handmade product.
                </p>

                <Link
                  to="/products/new"
                  className="inline-block mt-4 px-4 py-2 bg-kala-600 text-white rounded-lg text-sm font-medium hover:bg-kala-700"
                >
                  Add Product
                </Link>

              </div>
            ) : (
              <div className="space-y-3">

                {products.slice(0, 5).map(
                  (product) => {

                    const image =
                      product.product_images?.[0]
                        ?.image_url;

                    return (
                      <Link
                        key={product.id}
                        to={`/products/${product.id}/edit`}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-kala-50 transition"
                      >

                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">

                          {image ? (
                            <img
                              src={image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">
                              🖼️
                            </div>
                          )}

                        </div>


                        <div className="min-w-0 flex-1">

                          <p className="font-medium text-gray-800 truncate">
                            {product.name}
                          </p>

                          <p className="text-sm text-gray-500 mt-1">
                            ₹
                            {Number(
                              product.price
                            ).toLocaleString(
                              'en-IN'
                            )}{' '}
                            ·{' '}
                            {product.stock} in stock
                          </p>

                        </div>


                        <span
                          className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${
                            product.is_published
                              ? 'bg-green-50 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {product.is_published
                            ? 'Published'
                            : 'Draft'}
                        </span>

                      </Link>
                    );
                  }
                )}

              </div>
            )}

          </div>


          {/* Profile */}
          <div className="bg-white rounded-2xl border border-kala-100 shadow-sm p-6">

            <h2 className="text-lg font-semibold text-kala-700">
              Artisan Profile
            </h2>

            <div className="flex items-center gap-4 mt-5">

              <div className="w-16 h-16 rounded-full overflow-hidden bg-kala-50 flex items-center justify-center shrink-0">

                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">
                    👤
                  </span>
                )}

              </div>

              <div className="min-w-0">

                <p className="font-semibold text-gray-800 truncate">
                  {profile?.name ||
                    profile?.full_name ||
                    'Artisan'}
                </p>

                <p className="text-sm text-gray-500 mt-1 truncate">
                  {profile?.craft_type ||
                    'Craft type not added'}
                </p>

              </div>

            </div>


            <div className="mt-5 space-y-3">

              {profile?.location && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>📍</span>
                  <span>{profile.location}</span>
                </div>
              )}

              {profile?.years_experience && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>🎨</span>
                  <span>
                    {profile.years_experience} years of experience
                  </span>
                </div>
              )}

            </div>


            <Link
              to="/profile"
              className="block text-center mt-6 px-4 py-2.5 border border-kala-200 text-kala-700 rounded-xl text-sm font-medium hover:bg-kala-50 transition"
            >
              Edit Profile
            </Link>

          </div>

        </div>


        {/* Future features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="bg-white rounded-2xl border border-kala-100 p-5">
            <div className="text-2xl mb-3">
              🛍️
            </div>

            <h3 className="font-semibold text-kala-700">
              Orders
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Order management will be added in a later phase.
            </p>
          </div>


          <div className="bg-white rounded-2xl border border-kala-100 p-5">
            <div className="text-2xl mb-3">
              📊
            </div>

            <h3 className="font-semibold text-kala-700">
              Analytics
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Product performance analytics will be added later.
            </p>
          </div>


          <div className="bg-white rounded-2xl border border-kala-100 p-5">
            <div className="text-2xl mb-3">
              ✨
            </div>

            <h3 className="font-semibold text-kala-700">
              AI Tools
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              AI-powered artisan tools will come in later phases.
            </p>
          </div>

        </div>

      </div>

      <MobileArtisanNav />

    </div>
  );
}