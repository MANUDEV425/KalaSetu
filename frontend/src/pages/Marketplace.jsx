import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { supabase } from '../lib/supabaseClient';

export default function Marketplace() {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  async function loadProducts() {
    setLoading(true);
    setError('');

    const { data, error: productError } =
      await supabase
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
          ),
          profiles (
            id,
            name,
            full_name
          )
        `)
        .eq('is_published', true)
        .order('created_at', {
          ascending: false,
        });

    if (productError) {
      console.error(productError);

      setError(
        'Unable to load marketplace products.'
      );

      setProducts([]);
    } else {
      setProducts(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const values = products
      .map((product) => product.craft_type)
      .filter(Boolean);

    return [...new Set(values)].sort();
  }, [products]);

  const categoryCounts = useMemo(() => {
    const counts = {};

    products.forEach((product) => {
      if (!product.craft_type) {
        return;
      }

      counts[product.craft_type] =
        (counts[product.craft_type] || 0) + 1;
    });

    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        product.description
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        product.craft_type
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        product.profiles?.name
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        product.profiles?.full_name
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesCategory =
        category === 'all' ||
        product.craft_type === category;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    products,
    search,
    category,
  ]);

  const hasFilters =
    search.trim() !== '' ||
    category !== 'all';

  function clearFilters() {
    setSearch('');
    setCategory('all');
  }

  return (
    <div className="min-h-screen bg-kala-50">

      {/* Hero */}
      <section className="bg-kala-600 text-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

          <p className="text-kala-100 text-sm font-medium uppercase tracking-wider">
            KalaSetu Marketplace
          </p>

          <h1 className="text-3xl sm:text-5xl font-bold mt-3 leading-tight">
            Discover handmade
            <br />
            craftsmanship.
          </h1>

          <p className="text-kala-100 mt-4 max-w-2xl text-base sm:text-lg">
            Explore products created by independent artisans
            and discover the stories behind their craft.
          </p>

        </div>

      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Categories */}
        {!loading &&
          categories.length > 0 && (
            <section className="mb-8">

              <div className="mb-4">

                <h2 className="text-xl font-bold text-kala-700">
                  Explore Crafts
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Browse products by craft
                </p>

              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">

                <button
                  type="button"
                  onClick={() =>
                    setCategory('all')
                  }
                  className={`p-4 rounded-xl border text-left transition ${
                    category === 'all'
                      ? 'bg-kala-600 text-white border-kala-600'
                      : 'bg-white text-kala-700 border-kala-100 hover:bg-kala-50'
                  }`}
                >

                  <div className="text-2xl mb-2">
                    🏺
                  </div>

                  <p className="font-medium">
                    All Crafts
                  </p>

                  <p
                    className={`text-xs mt-1 ${
                      category === 'all'
                        ? 'text-kala-100'
                        : 'text-gray-500'
                    }`}
                  >
                    {products.length} products
                  </p>

                </button>

                {categories
                  .slice(0, 9)
                  .map((craft) => (
                    <button
                      key={craft}
                      type="button"
                      onClick={() =>
                        setCategory(craft)
                      }
                      className={`p-4 rounded-xl border text-left transition ${
                        category === craft
                          ? 'bg-kala-600 text-white border-kala-600'
                          : 'bg-white text-kala-700 border-kala-100 hover:bg-kala-50'
                      }`}
                    >

                      <div className="text-2xl mb-2">
                        🎨
                      </div>

                      <p className="font-medium truncate">
                        {craft}
                      </p>

                      <p
                        className={`text-xs mt-1 ${
                          category === craft
                            ? 'text-kala-100'
                            : 'text-gray-500'
                        }`}
                      >
                        {categoryCounts[craft]} products
                      </p>

                    </button>
                  ))}

              </div>

            </section>
          )}

        {/* Search */}
        <div className="bg-white rounded-2xl border border-kala-100 shadow-sm p-4 mb-8">

          <div className="flex flex-col lg:flex-row gap-3">

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
                placeholder="Search products, crafts or artisans..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-kala-200 focus:border-kala-400"
              />

            </div>

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              className="lg:w-56 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-kala-200"
            >

              <option value="all">
                All Crafts
              </option>

              {categories.map((craft) => (
                <option
                  key={craft}
                  value={craft}
                >
                  {craft}
                </option>
              ))}

            </select>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="px-5 py-3 rounded-xl border border-kala-200 text-kala-700 font-medium hover:bg-kala-50 transition"
              >
                Clear
              </button>
            )}

          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

              <p>
                {error}
              </p>

              <button
                type="button"
                onClick={loadProducts}
                className="px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium"
              >
                Try Again
              </button>

            </div>

          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl border border-kala-100 p-12 text-center">

            <div className="text-4xl mb-3">
              ⏳
            </div>

            <p className="text-gray-500">
              Discovering products...
            </p>

          </div>
        )}

        {/* No products */}
        {!loading &&
          !error &&
          products.length === 0 && (
            <div className="bg-white rounded-2xl border border-kala-100 p-12 text-center">

              <div className="text-5xl mb-4">
                🏺
              </div>

              <h2 className="text-xl font-semibold text-kala-700">
                Marketplace is getting ready
              </h2>

              <p className="text-gray-500 mt-2">
                No published products are available yet.
              </p>

            </div>
          )}

        {/* No search results */}
        {!loading &&
          products.length > 0 &&
          filteredProducts.length === 0 && (
            <div className="bg-white rounded-2xl border border-kala-100 p-10 text-center">

              <div className="text-4xl mb-3">
                🔎
              </div>

              <h2 className="text-lg font-semibold text-kala-700">
                No products found
              </h2>

              <p className="text-gray-500 mt-1">
                Try another craft, artisan or search term.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 px-4 py-2 rounded-lg border border-kala-200 text-kala-700 text-sm font-medium hover:bg-kala-50"
              >
                Clear Filters
              </button>

            </div>
          )}

        {/* Products */}
        {!loading &&
          filteredProducts.length > 0 && (
            <section>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">

                <div>

                  <h2 className="text-xl font-bold text-kala-700">
                    {category === 'all'
                      ? 'All Products'
                      : category}
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Showing {filteredProducts.length} of{' '}
                    {products.length} product
                    {products.length === 1
                      ? ''
                      : 's'}
                  </p>

                </div>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm text-kala-600 hover:text-kala-800 font-medium text-left"
                  >
                    Reset filters
                  </button>
                )}

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

                {filteredProducts.map(
                  (product) => {

                    const image =
                      product.product_images?.[0]
                        ?.image_url;

                    const artisan =
                      product.profiles;

                    const artisanName =
                      artisan?.name ||
                      artisan?.full_name ||
                      'KalaSetu Artisan';

                    return (
                      <div
                        key={product.id}
                        className="group bg-white rounded-2xl border border-kala-100 shadow-sm overflow-hidden hover:shadow-md transition"
                      >

                        <Link
                          to={`/marketplace/${product.id}`}
                          className="block"
                        >

                          <div className="aspect-square bg-gray-100 overflow-hidden">

                            {image ? (
                              <img
                                src={image}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-5xl text-gray-300">
                                🖼️
                              </div>
                            )}

                          </div>

                        </Link>

                        <div className="p-5">

                          {product.craft_type && (
                            <p className="text-xs font-medium uppercase tracking-wide text-kala-500">
                              {product.craft_type}
                            </p>
                          )}

                          <Link
                            to={`/marketplace/${product.id}`}
                            className="block"
                          >
                            <h3 className="font-semibold text-lg text-kala-700 mt-1 line-clamp-2 hover:text-kala-500 transition">
                              {product.name}
                            </h3>
                          </Link>

                          {artisan?.id ? (
                            <Link
                              to={`/artisans/${artisan.id}`}
                              className="inline-block text-sm text-gray-500 hover:text-kala-600 mt-2 transition"
                            >
                              By {artisanName} →
                            </Link>
                          ) : (
                            <p className="text-sm text-gray-500 mt-2">
                              By {artisanName}
                            </p>
                          )}

                          <p className="text-xl font-bold text-kala-700 mt-3">
                            ₹
                            {Number(
                              product.price
                            ).toLocaleString('en-IN')}
                          </p>

                          {Number(product.stock) > 0 ? (
                            <p className="text-sm text-green-600 mt-2">
                              In stock
                            </p>
                          ) : (
                            <p className="text-sm text-red-600 mt-2">
                              Out of stock
                            </p>
                          )}

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </section>
          )}

      </main>

    </div>
  );
}