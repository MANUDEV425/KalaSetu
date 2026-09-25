import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { uploadProfilePhoto } from '../lib/cloudinary';

export default function Profile() {
  const { user, profile } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    craft_type: '',
    years_experience: '',
    short_intro: '',
    artisan_story: '',
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  /*
   * Load the existing artisan profile.
   *
   * Phase 1 already has full_name in the profiles table.
   * Phase 2 adds the new artisan-specific fields.
   */
  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]);

  async function loadProfile() {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        name,
        avatar_url,
        location,
        craft_type,
        years_experience,
        short_intro,
        artisan_story
      `)
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error loading profile:', error.message);
      setError('Could not load your profile.');
      setLoading(false);
      return;
    }

    setFormData({
      name: data.name || data.full_name || '',
      location: data.location || '',
      craft_type: data.craft_type || '',
      years_experience:
        data.years_experience ?? '',
      short_intro: data.short_intro || '',
      artisan_story: data.artisan_story || '',
    });

    if (data.avatar_url) {
      setPhotoPreview(data.avatar_url);
    }

    setLoading(false);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError('');
    setMessage('');

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Profile photo must be smaller than 5 MB.');
      return;
    }

    setProfilePhoto(file);

    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!user?.id) {
      setError('You must be logged in to update your profile.');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      let avatarUrl = profile?.avatar_url || null;

      /*
       * Upload the new photo to Cloudinary first.
       */
      if (profilePhoto) {
        setUploadingPhoto(true);

        avatarUrl = await uploadProfilePhoto(profilePhoto);

        setUploadingPhoto(false);
      }

      /*
       * Save the Cloudinary URL and profile information
       * to the existing Supabase profiles table.
       */
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.name.trim(),
          name: formData.name.trim(),
          avatar_url: avatarUrl,
          location: formData.location.trim(),
          craft_type: formData.craft_type.trim(),
          years_experience:
            formData.years_experience === ''
              ? null
              : Number(formData.years_experience),
          short_intro: formData.short_intro.trim(),
          artisan_story: formData.artisan_story.trim(),
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      setMessage('Profile saved successfully!');

      /*
       * Reload from Supabase so the page always reflects
       * the actual database state.
       */
      await loadProfile();

      setProfilePhoto(null);
    } catch (err) {
      console.error('Profile update error:', err);

      setError(
        err.message ||
          'Something went wrong while saving your profile.'
      );
    } finally {
      setSaving(false);
      setUploadingPhoto(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-kala-100 p-8 text-center">
          <p className="text-gray-500">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-gray-500 mb-1">
          Artisan Profile
        </p>

        <h1 className="text-2xl sm:text-3xl font-bold text-kala-700">
          Tell your story
        </h1>

        <p className="text-gray-600 mt-2">
          Help people discover the person and craft behind
          your products.
        </p>
      </div>

      <form onSubmit={handleSubmit}>

        {/* Profile photo */}
        <div className="bg-white rounded-2xl shadow-sm border border-kala-100 p-6 sm:p-8 mb-6">

          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            Profile Photo
          </h2>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

            <div className="w-28 h-28 rounded-full overflow-hidden bg-kala-50 border-4 border-kala-100 flex items-center justify-center flex-shrink-0">

              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl">
                  👤
                </span>
              )}

            </div>

            <div className="text-center sm:text-left">

              <label
                htmlFor="profile-photo"
                className="inline-block cursor-pointer px-5 py-2.5 rounded-xl bg-kala-700 text-white text-sm font-medium hover:bg-kala-800 transition"
              >
                Choose Photo
              </label>

              <input
                id="profile-photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />

              <p className="text-xs text-gray-500 mt-3">
                JPG, PNG or other image format.
                Maximum 5 MB.
              </p>

              {profilePhoto && (
                <p className="text-xs text-kala-700 mt-2">
                  New photo selected
                </p>
              )}

            </div>

          </div>
        </div>

        {/* Basic information */}
        <div className="bg-white rounded-2xl shadow-sm border border-kala-100 p-6 sm:p-8 mb-6">

          <h2 className="text-lg font-semibold text-gray-800 mb-6">
            About You
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Name */}
            <FormField
              label="Name"
              required
            >
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
               className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-kala-500 focus:ring-2 focus:ring-kala-100"
              />
            </FormField>

            {/* Location */}
            <FormField label="Location">
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Jaipur, Rajasthan"
                className="input-field"
              />
            </FormField>

            {/* Craft type */}
            <FormField label="Craft Type">
              <input
                type="text"
                name="craft_type"
                value={formData.craft_type}
                onChange={handleChange}
                placeholder="Pottery, weaving, jewellery..."
                className="input-field"
              />
            </FormField>

            {/* Experience */}
            <FormField label="Years of Experience">
              <input
                type="number"
                name="years_experience"
                value={formData.years_experience}
                onChange={handleChange}
                placeholder="10"
                min="0"
                max="100"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-kala-500 focus:ring-2 focus:ring-kala-100"
              />
            </FormField>

          </div>

          {/* Short intro */}
          <div className="mt-5">

            <FormField label="Short Introduction">

              <textarea
                name="short_intro"
                value={formData.short_intro}
                onChange={handleChange}
                placeholder="Tell people a little about yourself and your craft..."
                rows="4"
                maxLength="300"
                className="input-field resize-none"
              />

              <p className="text-xs text-gray-400 mt-1 text-right">
                {formData.short_intro.length}/300
              </p>

            </FormField>

          </div>

        </div>

        {/* Artisan story */}
        <div className="bg-white rounded-2xl shadow-sm border border-kala-100 p-6 sm:p-8 mb-6">

          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Your Artisan Story
          </h2>

          <p className="text-sm text-gray-500 mb-5">
            Share your journey, your traditions, and what
            makes your craft special.
          </p>

          <textarea
            name="artisan_story"
            value={formData.artisan_story}
            onChange={handleChange}
            placeholder="For example: I learned pottery from my father when I was 12..."
            rows="8"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-kala-500 focus:ring-2 focus:ring-kala-100 resize-y"
          />

        </div>

        {/* Messages */}
        {error && (
          <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {/* Save */}
        <div className="flex justify-end">

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-kala-700 text-white font-medium hover:bg-kala-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {saving
              ? uploadingPhoto
                ? 'Uploading photo...'
                : 'Saving...'
              : 'Save Profile'}
          </button>

        </div>

      </form>
    </div>
  );
}


/* -----------------------------------------
   Reusable form field
----------------------------------------- */

function FormField({
  label,
  required = false,
  children,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}

        {required && (
          <span className="text-red-500 ml-1">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}