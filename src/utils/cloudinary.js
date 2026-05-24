/**
 * Transforms a Cloudinary image URL to apply on-the-fly transformations
 * such as auto format, auto quality compression, and width limiting.
 *
 * @param {string} url - The original Cloudinary URL.
 * @param {number} width - Target width in pixels.
 * @returns {string} The transformed URL or the original if not a Cloudinary URL.
 */
export const getOptimizedImageUrl = (url, width = 500) => {
  if (!url) return '';
  if (typeof url !== 'string') return url;
  
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    // Inserts transformations: f_auto (auto format), q_auto (auto quality), c_scale, and w_xxx (width)
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_scale/`);
  }
  return url;
};
