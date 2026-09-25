import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { supabase } from '../lib/supabaseClient';

export default function ArtisanProfile() {
  const { id } = useParams();

  const [artisan, setArtisan] = useState(null);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadArtisan() {
    setLoading(true);
    setError('');

    const { data: artisanData, error: artisanError } =
      await supabase
        .from('profiles')
        .select(`
          id,
          name,
          full_name,
          avatar_url,
          location,
          craft_type,
          years_experience,
          short_intro,
          artisan_story
        `)
        .eq('id', id)
        .eq('role', 'artisan')
        .single();

    if (artisanError) {
      console.error(artisanError);

      setError('Artisan not found.');
      setArtisan(null);
      setProducts([]);
      setLoading(false);

      return;
    }

    const { data: productData, error: productError } =
      await supabase
        .from('products')
        .select(`
          id,
          name,
          craft_type,
          price,
          stock,
          created_at,
          product_images (
            id,
            image_url
          )
        `)
        .eq('artisan_id', id)
        .eq('is_published', true)
        .order('created_at', {
          ascending: false,
        });

    if (productError) {
      console.error(productError);
    }

    setArtisan(artisanData);
    setProducts(productData || []);
    setLoading(false);
  }

  useEffect(() => {
    loadArtisan();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-kala-50 flex items-center justify-center px-4">
        <div className="text-center">

          <div className="text-4xl mb-3">
            ⏳
          </div>

          <p className="text-gray-500">
            Loading artisan profile...
          </p>

        </div>
      </div>
    );
  }

  if (error || !artisan) {
    return (
      <div className="min-h-screen bg-kala-50 px-4 py-12">

        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-kala-100 p-10 text-center">

          <div className="text-5xl mb-4">
            👤
          </div>

          <h1 className="text-2xl font-bold text-kala-700">
            Artisan not found
          </h1>

          <p className="text-gray-500 mt-2">
            This artisan profile is not available.
          </p>

          <Link
            to="/"
            className="inline-block mt-6 px-5 py-3 rounded-xl bg-kala-600 text-white font-medium hover:bg-kala-700 transition"
          >
            Back to Marketplace
          </Link>

        </div>

      </div>
    );
  }

  const artisanName =
    artisan.name ||
    artisan.full_name ||
    'KalaSetu Artisan';

  return (
    <div className="min-h-screen bg-kala-50">

      {/* Profile header */}
      <section className="bg-kala-600 text-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

          <Link
            to="/"
            className="inline-flex items-center text-sm text-kala-100 hover:text-white mb-8"
          >
            ← Back to Marketplace
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">

            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden bg-kala-100 flex items-center justify-center shrink-0 border-4 border-white/20">

              {artisan.avatar_url ? (
                <img
                  src={artisan.avatar_url}
                  alt={artisanName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-5xl text-kala-600">
                  👤
                </span>
              )}

            </div>

            <div>

              <p className="text-kala-100 text-sm uppercase tracking-wider font-medium">
                KalaSetu Artisan
              </p>

              <h1 className="text-3xl sm:text-4xl font-bold mt-2">
                {artisanName}
              </h1>

              {artisan.short_intro && (
                <p className="text-kala-100 mt-3 max-w-2xl text-base sm:text-lg">
                  {artisan.short_intro}
                </p>
              )}

              <div className="flex flex-wrap gap-3 mt-4">

                {artisan.craft_type && (
                  <span className="px-3 py-1 rounded-full bg-white/10 text-sm">
                    🎨 {artisan.craft_type}
                  </span>
                )}

                {artisan.location && (
                  <span className="px-3 py-1 rounded-full bg-white/10 text-sm">
                    📍 {artisan.location}
                  </span>
                )}

                {artisan.years_experience && (
                  <span className="px-3 py-1 rounded-full bg-white/10 text-sm">
                    🛠️ {artisan.years_experience} years experience
                  </span>
                )}

              </div>

            </div>

          </div>

        </div>

      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Story */}
        {artisan.artisan_story && (
          <section className="bg-white rounded-2xl border border-kala-100 p-6 sm:p-8 mb-8">

            <h2 className="text-xl font-bold text-kala-700">
              The Artisan's Story
            </h2>

            <p className="text-gray-600 leading-7 mt-4 whitespace-pre-line max-w-4xl">
              {artisan.artisan_story}
            </p>

          </section>
        )}

        {/* Products */}
        <section>

          <div className="flex items-center justify-between mb-5">

            <div>

              <h2 className="text-2xl font-bold text-kala-700">
                Products by {artisanName}
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {products.length} published product
                {products.length === 1 ? '' : 's'}
              </p>

            </div>

          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-kala-100 p-10 text-center">

              <div className="text-5xl mb-4">
                🏺
              </div>

              <h3 className="text-lg font-semibold text-kala-700">
                No published products yet
              </h3>

              <p className="text-gray-500 mt-2">
                This artisan has not published any products yet.
              </p>

            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

              {products.map((product) => {

                const image =
                  product.product_images?.[0]?.image_url;

                return (
                  <Link
                    key={product.id}
                    to={`/marketplace/${product.id}`}
                    className="group bg-white rounded-2xl border border-kala-100 shadow-sm overflow-hidden hover:shadow-md transition"
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

                    <div className="p-5">

                      {product.craft_type && (
                        <p className="text-xs uppercase tracking-wide text-kala-500 font-medium">
                          {product.craft_type}
                        </p>
                      )}

                      <h3 className="text-lg font-semibold text-kala-700 mt-1 line-clamp-2">
                        {product.name}
                      </h3>

                      <div className="flex items-center justify-between mt-3">

                        <p className="text-xl font-bold text-kala-700">
                          ₹
                          {Number(
                            product.price
                          ).toLocaleString('en-IN')}
                        </p>

                        {Number(product.stock) > 0 ? (
                          <span className="text-xs text-green-600">
                            In stock
                          </span>
                        ) : (
                          <span className="text-xs text-red-600">
                            Out of stock
                          </span>
                        )}

                      </div>

                    </div>

                  </Link>
                );
              })}

            </div>
          )}

        </section>

      </main>

    </div>
  );
}