import { useEffect, useState } from 'react';
import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

import {
  uploadImage,
  getEnhancedImageUrl,
} from '../lib/cloudinary';

import { generateProductDescription } from '../lib/ai';
import { generatePriceSuggestion } from '../lib/pricingAI';
import { generateMarketingKit } from '../lib/marketingAI';

import MobileArtisanNav from '../components/MobileArtisanNav';

export default function ProductForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    craft_type: '',
    price: '',
    stock: '',
    is_published: false,
  });

  const [existingImages, setExistingImages] =
    useState([]);

  const [newImages, setNewImages] =
    useState([]);

  const [previews, setPreviews] =
    useState([]);

  const [enhancedNewImages, setEnhancedNewImages] =
    useState([]);

  const [loading, setLoading] =
    useState(isEditMode);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [aiLoading, setAiLoading] =
    useState(false);

  const [enhancingImageId, setEnhancingImageId] =
    useState(null);

  const [enhancingNewImageIndex, setEnhancingNewImageIndex] =
    useState(null);

  const [priceAIloading, setPriceAILoading] =
    useState(false);

  const [priceSuggestion, setPriceSuggestion] =
    useState('');

  const [marketingKit, setMarketingKit] =
    useState('');

  const [marketingLoading, setMarketingLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  useEffect(() => {
    if (isEditMode && user) {
      loadProduct();
    }
  }, [id, user]);

  async function loadProduct() {
    setLoading(true);
    setError('');

    const {
      data,
      error: productError,
    } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        craft_type,
        price,
        stock,
        is_published,
        product_images (
          id,
          image_url
        )
      `)
      .eq('id', id)
      .eq('artisan_id', user.id)
      .single();

    if (productError) {
      console.error(productError);

      setError(
        'Product could not be found.'
      );

      setLoading(false);
      return;
    }

    setFormData({
      name: data.name || '',
      description: data.description || '',
      craft_type: data.craft_type || '',
      price: data.price ?? '',
      stock: data.stock ?? '',
      is_published:
        data.is_published || false,
    });

    setExistingImages(
      data.product_images || []
    );

    setLoading(false);
  }

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }));
  }

  function handleImageChange(event) {
    const selectedFiles = Array.from(
      event.target.files || []
    );

    if (selectedFiles.length === 0) {
      return;
    }

    const validFiles = selectedFiles.filter(
      (file) => {
        if (!file.type.startsWith('image/')) {
          return false;
        }

        if (file.size > 5 * 1024 * 1024) {
          return false;
        }

        return true;
      }
    );

    const totalImages =
      existingImages.length +
      newImages.length;

    const remainingSlots =
      5 - totalImages;

    const filesToAdd =
      validFiles.slice(
        0,
        remainingSlots
      );

    if (filesToAdd.length === 0) {
      event.target.value = '';
      return;
    }

    const updatedImages = [
      ...newImages,
      ...filesToAdd,
    ];

    setNewImages(updatedImages);

    setPreviews(
      updatedImages.map((file) =>
        URL.createObjectURL(file)
      )
    );

    setEnhancedNewImages(
      (previous) => [
        ...previous,
        ...filesToAdd.map(
          () => null
        ),
      ]
    );

    event.target.value = '';
  }

  function removeNewImage(index) {
    const updatedImages =
      newImages.filter(
        (_, imageIndex) =>
          imageIndex !== index
      );

    setNewImages(updatedImages);

    setPreviews(
      updatedImages.map((file) =>
        URL.createObjectURL(file)
      )
    );

    setEnhancedNewImages(
      (previous) =>
        previous.filter(
          (_, imageIndex) =>
            imageIndex !== index
        )
    );
  }

  async function removeExistingImage(
    imageId
  ) {
    const confirmed =
      window.confirm(
        'Remove this product image?'
      );

    if (!confirmed) {
      return;
    }

    setError('');

    const {
      error: deleteError,
    } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId);

    if (deleteError) {
      console.error(deleteError);

      setError(
        'Unable to remove the image.'
      );

      return;
    }

    setExistingImages(
      (previous) =>
        previous.filter(
          (image) =>
            image.id !== imageId
        )
    );
  }

  async function handleGenerateDescription() {
    setError('');
    setAiLoading(true);

    try {
      const generatedDescription =
        await generateProductDescription({
          name: formData.name,
          craftType:
            formData.craft_type,
          description:
            formData.description,
        });

      setFormData((previous) => ({
        ...previous,
        description:
          generatedDescription,
      }));
    } catch (aiError) {
      console.error(aiError);

      setError(
        aiError?.message ||
          'Unable to generate product description.'
      );
    } finally {
      setAiLoading(false);
    }
  }

  async function handleEnhanceImage(
    imageId,
    imageUrl
  ) {
    if (!imageUrl) {
      setError(
        'No product image available to enhance.'
      );

      return;
    }

    setError('');
    setEnhancingImageId(imageId);

    try {
      const enhancedUrl =
        getEnhancedImageUrl(
          imageUrl
        );

      const {
        error: updateError,
      } = await supabase
        .from('product_images')
        .update({
          image_url: enhancedUrl,
        })
        .eq('id', imageId);

      if (updateError) {
        throw updateError;
      }

      setExistingImages(
        (previous) =>
          previous.map((image) =>
            image.id === imageId
              ? {
                  ...image,
                  image_url:
                    enhancedUrl,
                }
              : image
          )
      );
    } catch (enhanceError) {
      console.error(enhanceError);

      setError(
        enhanceError?.message ||
          'Unable to enhance the image.'
      );
    } finally {
      setEnhancingImageId(null);
    }
  }

  async function handleEnhanceNewImage(
    index
  ) {
    const image = newImages[index];

    if (!image) {
      setError(
        'No image available to enhance.'
      );

      return;
    }

    setError('');
    setEnhancingNewImageIndex(index);

    try {
      let imageUrl =
        enhancedNewImages[index];

      if (!imageUrl) {
        imageUrl =
          await uploadImage(image);
      }

      const enhancedUrl =
        getEnhancedImageUrl(
          imageUrl
        );

      setEnhancedNewImages(
        (previous) => {
          const updated = [
            ...previous,
          ];

          updated[index] =
            enhancedUrl;

          return updated;
        }
      );
    } catch (enhanceError) {
      console.error(enhanceError);

      setError(
        enhanceError?.message ||
          'Unable to enhance the image.'
      );
    } finally {
      setEnhancingNewImageIndex(
        null
      );
    }
  }

  async function handleGeneratePrice() {
    setError('');
    setPriceAILoading(true);
    setPriceSuggestion('');

    try {
      const suggestion =
        await generatePriceSuggestion({
          name: formData.name,
          craftType:
            formData.craft_type,
          description:
            formData.description,
          currentPrice:
            formData.price,
        });

      setPriceSuggestion(
        suggestion
      );
    } catch (aiError) {
      console.error(aiError);

      setError(
        aiError?.message ||
          'Unable to generate price suggestion.'
      );
    } finally {
      setPriceAILoading(false);
    }
  }

  async function handleGenerateMarketingKit() {
    setError('');
    setMarketingLoading(true);
    setMarketingKit('');

    try {
      const kit =
        await generateMarketingKit({
          name: formData.name,
          craftType:
            formData.craft_type,
          description:
            formData.description,
          price: formData.price,
        });

      setMarketingKit(kit);
    } catch (marketingError) {
      console.error(
        marketingError
      );

      setError(
        marketingError?.message ||
          'Unable to generate marketing kit.'
      );
    } finally {
      setMarketingLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');

    if (!user) {
      setError(
        'You must be logged in.'
      );

      return;
    }

    if (!formData.name.trim()) {
      setError(
        'Product name is required.'
      );

      return;
    }

    if (
      formData.price === '' ||
      Number(formData.price) < 0
    ) {
      setError(
        'Please enter a valid price.'
      );

      return;
    }

    if (
      formData.stock === '' ||
      Number(formData.stock) < 0
    ) {
      setError(
        'Please enter a valid stock quantity.'
      );

      return;
    }

    setSaving(true);

    try {
      let product;

      if (isEditMode) {
        const {
          data,
          error: updateError,
        } = await supabase
          .from('products')
          .update({
            name:
              formData.name.trim(),

            description:
              formData.description.trim(),

            craft_type:
              formData.craft_type.trim(),

            price:
              Number(formData.price),

            stock:
              Number(formData.stock),

            is_published:
              formData.is_published,
          })
          .eq('id', id)
          .eq('artisan_id', user.id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        product = data;
      } else {
        const {
          data,
          error: insertError,
        } = await supabase
          .from('products')
          .insert({
            artisan_id: user.id,

            name:
              formData.name.trim(),

            description:
              formData.description.trim(),

            craft_type:
              formData.craft_type.trim(),

            price:
              Number(formData.price),

            stock:
              Number(formData.stock),

            is_published:
              formData.is_published,
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        product = data;
      }

      if (newImages.length > 0) {
        const uploadedUrls = [];

        for (
          let index = 0;
          index < newImages.length;
          index++
        ) {
          let imageUrl =
            enhancedNewImages[index];

          if (!imageUrl) {
            imageUrl =
              await uploadImage(
                newImages[index]
              );
          }

          uploadedUrls.push(
            imageUrl
          );
        }

        const imageRows =
          uploadedUrls.map(
            (imageUrl) => ({
              product_id:
                product.id,

              image_url:
                imageUrl,
            })
          );

        const {
          error: imageError,
        } = await supabase
          .from('product_images')
          .insert(imageRows);

        if (imageError) {
          throw imageError;
        }
      }

      navigate('/products');
    } catch (submitError) {
      console.error(
        submitError
      );

      setError(
        submitError?.message ||
          'Something went wrong while saving the product.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProduct() {
    const confirmed =
      window.confirm(
        'Delete this product permanently? This action cannot be undone.'
      );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError('');

    const {
      error: deleteError,
    } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('artisan_id', user.id);

    if (deleteError) {
      console.error(deleteError);

      setError(
        'Unable to delete the product.'
      );

      setDeleting(false);
      return;
    }

    navigate('/products');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-kala-50 flex items-center justify-center">

        <div className="text-center">

          <div className="text-3xl mb-3">
            ⏳
          </div>

          <p className="text-gray-500">
            Loading product...
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kala-50 pb-20 md:pb-0">

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Header */}
        <div className="mb-7">

          <button
            type="button"
            onClick={() =>
              navigate('/products')
            }
            className="text-sm text-kala-600 hover:text-kala-700 mb-3"
          >
            ← Back to Products
          </button>

          <h1 className="text-2xl sm:text-3xl font-bold text-kala-700">
            {isEditMode
              ? 'Edit Product'
              : 'Add Product'}
          </h1>

          <p className="text-gray-500 mt-1">
            {isEditMode
              ? 'Update your product information.'
              : 'Add your handmade product to your KalaSetu catalogue.'}
          </p>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* Product Information */}
          <section className="bg-white rounded-2xl border border-kala-100 shadow-sm p-5 sm:p-7">

            <h2 className="text-lg font-semibold text-kala-700 mb-5">
              Product Information
            </h2>

            <div className="space-y-5">

              {/* Product Name */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Example: Handcrafted Blue Pottery Vase"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-kala-200 focus:border-kala-400"
                  disabled={saving}
                />

              </div>

              {/* Craft */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Craft / Category
                </label>

                <input
                  type="text"
                  name="craft_type"
                  value={formData.craft_type}
                  onChange={handleChange}
                  placeholder="Example: Blue Pottery"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-kala-200 focus:border-kala-400"
                  disabled={saving}
                />

              </div>

              {/* Description */}
              <div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">

                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>

                  <button
                    type="button"
                    onClick={
                      handleGenerateDescription
                    }
                    disabled={
                      saving ||
                      deleting ||
                      aiLoading ||
                      !formData.name.trim()
                    }
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-kala-50 border border-kala-200 text-kala-700 text-sm font-medium hover:bg-kala-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {aiLoading ? (
                      <>
                        <span>
                          ⏳
                        </span>
                        Generating...
                      </>
                    ) : (
                      <>
                        <span>
                          ✨
                        </span>
                        Generate with AI
                      </>
                    )}
                  </button>

                </div>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Describe your product, materials, craftsmanship, and anything buyers should know..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-kala-200 focus:border-kala-400 resize-none"
                  disabled={
                    saving ||
                    aiLoading
                  }
                />

                <p className="text-xs text-gray-400 mt-2">
                  Enter a product name first,
                  then use AI to create a
                  marketplace-ready description.
                </p>

              </div>

            </div>

          </section>

          {/* Pricing */}
          <section className="bg-white rounded-2xl border border-kala-100 shadow-sm p-5 sm:p-7">

            <h2 className="text-lg font-semibold text-kala-700 mb-5">
              Pricing & Stock
            </h2>

            {/* AI Price Advisor */}
            <div className="mb-5 p-4 rounded-xl bg-kala-50 border border-kala-100">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                <div>

                  <p className="font-medium text-kala-700">
                    ✨ AI Price Advisor
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Get an estimated price range based on your product details.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    handleGeneratePrice
                  }
                  disabled={
                    saving ||
                    deleting ||
                    priceAIloading ||
                    !formData.name.trim()
                  }
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-kala-600 text-white text-sm font-medium hover:bg-kala-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {priceAIloading
                    ? '⏳ Analyzing...'
                    : '✨ Suggest Price'}
                </button>

              </div>

              {priceSuggestion && (
                <div className="mt-4 p-4 rounded-lg bg-white border border-kala-100">

                  <p className="text-sm font-medium text-gray-700 mb-2">
                    AI Price Suggestion
                  </p>

                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {priceSuggestion}
                  </p>

                </div>
              )}

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>

                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="1200"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-kala-200 focus:border-kala-400"
                  disabled={saving}
                />

              </div>

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity in Stock *
                </label>

                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  placeholder="10"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-kala-200 focus:border-kala-400"
                  disabled={saving}
                />

              </div>

            </div>

          </section>

          {/* Images */}
          <section className="bg-white rounded-2xl border border-kala-100 shadow-sm p-5 sm:p-7">

            <h2 className="text-lg font-semibold text-kala-700">
              Product Images
            </h2>

            <p className="text-sm text-gray-500 mt-1 mb-5">
              Add up to 5 images. Each image must be smaller than 5 MB.
            </p>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-5">

                <p className="text-sm font-medium text-gray-700 mb-3">
                  Current Images
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">

                  {existingImages.map(
                    (image) => (
                      <div
                        key={image.id}
                        className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200"
                      >

                        <img
                          src={image.image_url}
                          alt="Product"
                          className="w-full h-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            handleEnhanceImage(
                              image.id,
                              image.image_url
                            )
                          }
                          disabled={
                            saving ||
                            enhancingImageId ===
                              image.id
                          }
                          className="absolute bottom-2 left-2 px-2.5 py-1.5 rounded-lg bg-kala-600 text-white text-xs font-medium hover:bg-kala-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {enhancingImageId ===
                          image.id ? (
                            <>
                              <span className="inline-block animate-spin mr-1">
                                ⏳
                              </span>
                              Enhancing...
                            </>
                          ) : (
                            <>
                              ✨ Enhance
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            removeExistingImage(
                              image.id
                            )
                          }
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                          disabled={saving}
                        >
                          ×
                        </button>

                      </div>
                    )
                  )}

                </div>

              </div>
            )}

            {/* New Images */}
            {previews.length > 0 && (
              <div className="mb-5">

                <p className="text-sm font-medium text-gray-700 mb-3">
                  New Images
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">

                  {previews.map(
                    (preview, index) => {

                      const hasEnhancedImage =
                        Boolean(
                          enhancedNewImages[
                            index
                          ]
                        );

                      return (
                        <div
                          key={`${preview}-${index}`}
                          className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200"
                        >

                          <img
                            src={
                              hasEnhancedImage
                                ? enhancedNewImages[
                                    index
                                  ]
                                : preview
                            }
                            alt={`New product ${index + 1}`}
                            className="w-full h-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              handleEnhanceNewImage(
                                index
                              )
                            }
                            disabled={
                              saving ||
                              enhancingNewImageIndex ===
                                index
                            }
                            className="absolute bottom-2 left-2 px-2.5 py-1.5 rounded-lg bg-kala-600 text-white text-xs font-medium hover:bg-kala-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {enhancingNewImageIndex ===
                            index ? (
                              <>
                                <span className="inline-block animate-spin mr-1">
                                  ⏳
                                </span>
                                Enhancing...
                              </>
                            ) : hasEnhancedImage ? (
                              <>
                                ✓ Enhanced
                              </>
                            ) : (
                              <>
                                ✨ Enhance
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              removeNewImage(
                                index
                              )
                            }
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                            disabled={saving}
                          >
                            ×
                          </button>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>
            )}

            {/* Upload */}
            {existingImages.length +
              newImages.length <
              5 && (
              <label className="block cursor-pointer">

                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-kala-300 hover:bg-kala-50/50 transition">

                  <div className="text-3xl mb-2">
                    📷
                  </div>

                  <p className="font-medium text-gray-700">
                    Click to upload images
                  </p>

                  <p className="text-sm text-gray-400 mt-1">
                    PNG, JPG, WEBP up to 5 MB
                  </p>

                </div>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={
                    handleImageChange
                  }
                  className="hidden"
                  disabled={saving}
                />

              </label>
            )}

          </section>

          {/* AI Marketing Kit */}
          <section className="bg-white rounded-2xl border border-kala-100 shadow-sm p-5 sm:p-7">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div>

                <h2 className="text-lg font-semibold text-kala-700">
                  ✨ AI Marketing Kit
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Turn your product details into ready-to-use marketing content.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  handleGenerateMarketingKit
                }
                disabled={
                  saving ||
                  deleting ||
                  marketingLoading ||
                  !formData.name.trim()
                }
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-kala-600 text-white text-sm font-medium hover:bg-kala-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {marketingLoading
                  ? '⏳ Creating...'
                  : '✨ Generate Marketing Kit'}
              </button>

            </div>

            {marketingKit && (
              <div className="mt-5 p-5 rounded-xl bg-kala-50 border border-kala-100">

                <p className="text-sm font-semibold text-kala-700 mb-3">
                  Your Marketing Kit
                </p>

                <div className="bg-white rounded-lg border border-kala-100 p-4">

                  <p className="text-sm text-gray-700 whitespace-pre-line leading-6">
                    {marketingKit}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigator.clipboard.writeText(
                      marketingKit
                    )
                  }
                  className="mt-3 px-4 py-2 rounded-lg border border-kala-200 text-kala-700 text-sm font-medium hover:bg-white transition"
                >
                  📋 Copy Marketing Kit
                </button>

              </div>
            )}

          </section>

          {/* Publishing */}
          <section className="bg-white rounded-2xl border border-kala-100 shadow-sm p-5 sm:p-7">

            <h2 className="text-lg font-semibold text-kala-700 mb-4">
              Publishing
            </h2>

            <label className="flex items-start gap-3 cursor-pointer">

              <input
                type="checkbox"
                name="is_published"
                checked={
                  formData.is_published
                }
                onChange={handleChange}
                className="mt-1 w-4 h-4"
                disabled={saving}
              />

              <div>

                <p className="font-medium text-gray-700">
                  Publish this product
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Published products will be ready for the marketplace.
                </p>

              </div>

            </label>

          </section>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">

            {isEditMode ? (
              <button
                type="button"
                onClick={
                  handleDeleteProduct
                }
                disabled={
                  saving ||
                  deleting
                }
                className="px-5 py-3 rounded-xl text-red-600 border border-red-200 hover:bg-red-50 transition font-medium disabled:opacity-50"
              >
                {deleting
                  ? 'Deleting...'
                  : 'Delete Product'}
              </button>
            ) : (
              <div />
            )}

            <div className="flex flex-col sm:flex-row gap-3">

              <button
                type="button"
                onClick={() =>
                  navigate('/products')
                }
                className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition"
                disabled={
                  saving ||
                  deleting
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  saving ||
                  deleting
                }
                className="px-6 py-3 rounded-xl bg-kala-600 text-white font-medium hover:bg-kala-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving
                  ? 'Saving...'
                  : isEditMode
                    ? 'Save Changes'
                    : 'Create Product'}
              </button>

            </div>

          </div>

        </form>

      </main>

      <MobileArtisanNav />

    </div>
  );
}