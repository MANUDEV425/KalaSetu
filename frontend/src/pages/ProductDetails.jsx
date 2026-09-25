import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { supabase } from '../lib/supabaseClient';

export default function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadProduct() {
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
            full_name,
            avatar_url,
            location,
            craft_type,
            short_intro,
            artisan_story
          )
        `)
        .eq('id', id)
        .eq('is_published', true)
        .single();

    if (productError) {
      console.error(productError);
      setError('Product not found.');
      setProduct(null);
    } else {
      setProduct(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-kala-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-4xl mb-3">⏳</div>

          <p className="text-gray-500">
            Loading product...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-kala-50 px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-kala-100 p-10 text-center">

          <div className="text-5xl mb-4">
            🏺
          </div>

          <h1 className="text-2xl font-bold text-kala-700">
            Product not found
          </h1>

          <p className="text-gray-500 mt-2">
            This product may have been removed or is no longer published.
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

  const images = product.product_images || [];

  const artisan = product.profiles;

  const artisanName =
    artisan?.name ||
    artisan?.full_name ||
    'KalaSetu Artisan';

  const currentImage =
    images[selectedImage]?.image_url;

  const inStock = Number(product.stock) > 0;

  return (
    <div className="min-h-screen bg-kala-50">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center text-sm text-kala-600 hover:text-kala-800 font-medium mb-6"
        >
          ← Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Images */}
          <section>

            <div className="aspect-square bg-white rounded-2xl border border-kala-100 overflow-hidden">

              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl text-gray-300">
                  🖼️
                </div>
              )}

            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-3 mt-4">

                {images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() =>
                      setSelectedImage(index)
                    }
                    className={`aspect-square rounded-xl overflow-hidden border-2 ${
                      selectedImage === index
                        ? 'border-kala-600'
                        : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}

              </div>
            )}

          </section>

          {/* Product information */}
          <section className="bg-white rounded-2xl border border-kala-100 p-6 sm:p-8">

            {product.craft_type && (
              <p className="text-sm font-medium uppercase tracking-wider text-kala-500">
                {product.craft_type}
              </p>
            )}

            <h1 className="text-3xl sm:text-4xl font-bold text-kala-700 mt-2">
              {product.name}
            </h1>

            <p className="text-3xl font-bold text-kala-700 mt-5">
              ₹
              {Number(product.price).toLocaleString(
                'en-IN'
              )}
            </p>

            <div className="mt-4">

              {inStock ? (
                <span className="inline-flex px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium">
                  In stock · {product.stock} available
                </span>
              ) : (
                <span className="inline-flex px-3 py-1 rounded-full bg-red-50 text-red-700 text-sm font-medium">
                  Currently out of stock
                </span>
              )}

            </div>

            {/* Description */}
            <div className="mt-8 pt-8 border-t border-gray-100">

              <h2 className="font-semibold text-kala-700">
                About this product
              </h2>

              <p className="text-gray-600 leading-7 mt-3 whitespace-pre-line">
                {product.description ||
                  'The artisan has not added a description yet.'}
              </p>

            </div>

            {/* Artisan */}
            {artisan?.id && (
              <div className="mt-8 pt-8 border-t border-gray-100">

                <h2 className="font-semibold text-kala-700 mb-4">
                  Meet the Artisan
                </h2>

                <Link
                  to={`/artisans/${artisan.id}`}
                  className="flex items-center gap-4 group"
                >

                  <div className="w-14 h-14 rounded-full overflow-hidden bg-kala-100 flex items-center justify-center shrink-0">

                    {artisan.avatar_url ? (
                      <img
                        src={artisan.avatar_url}
                        alt={artisanName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl">
                        👤
                      </span>
                    )}

                  </div>

                  <div className="min-w-0">

                    <p className="font-semibold text-kala-700 group-hover:text-kala-500 transition">
                      {artisanName}
                    </p>

                    {artisan.location && (
                      <p className="text-sm text-gray-500 mt-1">
                        📍 {artisan.location}
                      </p>
                    )}

                  </div>

                  <span className="ml-auto text-kala-500">
                    →
                  </span>

                </Link>

              </div>
            )}

            {/* Future purchase area */}
            <div className="mt-8 p-4 rounded-xl bg-kala-50 border border-kala-100">

              <p className="text-sm text-kala-700">
                Interested in this handcrafted product?
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Direct purchasing and orders will be added in a later phase.
              </p>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}