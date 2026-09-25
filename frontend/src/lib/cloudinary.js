const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;


/*
 * Upload one image to Cloudinary
 */
export async function uploadImage(file) {
  if (!file) {
    throw new Error('Please select an image.');
  }

  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error(
      'Cloudinary cloud name is missing.'
    );
  }

  if (!CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary upload preset is missing.'
    );
  }

  if (!file.type.startsWith('image/')) {
    throw new Error(
      'Please select a valid image file.'
    );
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error(
      'Image must be smaller than 5 MB.'
    );
  }

  const formData = new FormData();

  formData.append('file', file);
  formData.append(
    'upload_preset',
    CLOUDINARY_UPLOAD_PRESET
  );

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.error?.message ||
        'Failed to upload image to Cloudinary.'
    );
  }

  if (!result.secure_url) {
    throw new Error(
      'Cloudinary did not return an image URL.'
    );
  }

  return result.secure_url;
}


/*
 * Keep the old profile-photo function working.
 *
 * This means your existing Profile.jsx does not
 * need to be changed.
 */
export async function uploadProfilePhoto(file) {
  return uploadImage(file);
}
export function getEnhancedImageUrl(imageUrl) {
  if (!imageUrl) {
    throw new Error('Image URL is required.');
  }

  return imageUrl.replace(
    '/upload/',
    '/upload/e_background_removal,c_auto,g_auto,w_1200,h_1200,f_auto,q_auto/'
  );
}