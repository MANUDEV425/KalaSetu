import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import MobileArtisanNav from '../components/MobileArtisanNav';

export default function Products() {
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  async function loadProducts() {
    if (!user) return;

    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        craft_type,
        price,
        stock,
        is_published,
        created_at,
        product_images (
          id,
          image_url
        )
      `)
      .eq('artisan_id', user.id)
      .order('created_at', {
        ascending: false,
      });

    if (error) {
      console.error(error);
      setError('Unable to load your products.');
      setProducts([]);
    } else {
      setProducts(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, [user]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        product.craft_type
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesFilter =
        filter === 'all' ||
        (filter === 'published' &&
          product.is_published) ||
        (filter === 'draft' &&
          !product.is_published) ||
        (filter === 'out_of_stock' &&
          Number(product.stock) === 0);

      return matchesSearch && matchesFilter;
    });
  }, [products, search, filter]);

  return (
    <div className="min-h-screen bg-kala-50 pb-20 md:pb-0">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-kala-700">
              My Products
            </h1>

            <p className="text-gray-500 mt-1">
              {products.length} product
              {products.length === 1 ? '' : 's'} in your catalogue
            </p>
          </div>

          <Link
            to="/products/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-kala-600 text-white rounded-xl font-medium hover:bg-kala-700 transition shadow-sm"
          >
            <span className="text-lg">+</span>
            Add Product
          </Link>

        </div>


        {/* Search + filters */}
        {products.length > 0 && (
          <div className="bg-white rounded-2xl border border-kala-100 shadow-sm p-4 mb-6">

            <div className="flex flex-col lg:flex-row gap-3">

              {/* Search */}
              <div className="relative flex-1">

                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  🔍
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search your products..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-kala-200 focus:border-kala-400"
                />

              </div>


              {/* Filter */}
              <select
                value={filter}
                onChange={(event) =>
                  setFilter(event.target.value)
                }
                className="px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-kala-200"
              >
                <option value="all">
                  All Products
                </option>

                <option value="published">
                  Published
                </option>

                <option value="draft">
                  Drafts
                </option>

                <option value="out_of_stock">
                  Out of Stock
                </option>
              </select>

            </div>

          </div>
        )}


        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600">
            {error}
          </div>
        )}


        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl border border-kala-100 shadow-sm p-10 text-center">

            <div className="text-3xl mb-3">
              ⏳
            </div>

            <p className="text-gray-500">
              Loading your products...
            </p>

          </div>
        )}


        {/* Empty state */}
        {!loading && products.length === 0 && (
          <div className="bg-white rounded-2xl border border-kala-100 shadow-sm p-10 sm:p-14 text-center">

            <div className="w-20 h-20 mx-auto rounded-2xl bg-kala-50 flex items-center justify-center text-4xl mb-5">
              📦
            </div>

            <h2 className="text-xl sm:text-2xl font-semibold text-kala-700">
              No products yet
            </h2>

            <p className="text-gray-500 max-w-md mx-auto mt-2">
              Add your first handmade product and start building your artisan catalogue.
            </p>

            <Link
              to="/products/new"
              className="inline-flex items-center justify-center gap-2 mt-6 px-5 py-3 bg-kala-600 text-white rounded-xl font-medium hover:bg-kala-700 transition"
            >
              <span>+</span>
              Add Your First Product
            </Link>

          </div>
        )}


        {/* No filtered results */}
        {!loading &&
          products.length > 0 &&
          filteredProducts.length === 0 && (
            <div className="bg-white rounded-2xl border border-kala-100 shadow-sm p-10 text-center">

              <div className="text-4xl mb-3">
                🔎
              </div>

              <h2 className="text-lg font-semibold text-kala-700">
                No matching products
              </h2>

              <p className="text-gray-500 mt-1">
                Try changing your search or filter.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setFilter('all');
                }}
                className="mt-5 px-4 py-2 rounded-lg border border-kala-200 text-kala-700 text-sm font-medium hover:bg-kala-50"
              >
                Clear Filters
              </button>

            </div>
          )}


        {/* Products */}
        {!loading &&
          filteredProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

              {filteredProducts.map((product) => {

                const firstImage =
                  product.product_images?.[0]?.image_url;

                const stock = Number(
                  product.stock || 0
                );

                const stockStatus =
                  stock === 0
                    ? 'out'
                    : stock <= 5
                      ? 'low'
                      : 'available';

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-kala-100 shadow-sm overflow-hidden"
                  >

                    {/* Image */}
                    <div className="aspect-[4/3] bg-gray-100 relative">

                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl text-gray-300">
                          🖼️
                        </div>
                      )}

                      {/* Status */}
                      <span
                        className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium ${
                          product.is_published
                            ? 'bg-green-50 text-green-700'
                            : 'bg-white text-gray-600'
                        }`}
                      >
                        {product.is_published
                          ? 'Published'
                          : 'Draft'}
                      </span>

                    </div>


                    {/* Content */}
                    <div className="p-5">

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <h2 className="font-semibold text-lg text-kala-700 line-clamp-2">
                            {product.name}
                          </h2>

                          {product.craft_type && (
                            <p className="text-sm text-gray-500 mt-1">
                              {product.craft_type}
                            </p>
                          )}

                        </div>

                      </div>


                      {/* Price */}
                      <p className="text-xl font-bold text-kala-700 mt-4">
                        ₹
                        {Number(
                          product.price
                        ).toLocaleString('en-IN')}
                      </p>


                      {/* Stock */}
                      <div className="mt-3">

                        {stockStatus === 'out' && (
                          <span className="text-sm text-red-600 font-medium">
                            Out of stock
                          </span>
                        )}

                        {stockStatus === 'low' && (
                          <span className="text-sm text-orange-600 font-medium">
                            Only {stock} left
                          </span>
                        )}

                        {stockStatus === 'available' && (
                          <span className="text-sm text-gray-500">
                            {stock} in stock
                          </span>
                        )}

                      </div>


                      {/* Action */}
                      <Link
                        to={`/products/${product.id}/edit`}
                        className="block text-center mt-5 px-4 py-2.5 rounded-xl border border-kala-200 text-kala-700 text-sm font-medium hover:bg-kala-50 transition"
                      >
                        Manage Product
                      </Link>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

      </main>

      <MobileArtisanNav />

    </div>
  );
}